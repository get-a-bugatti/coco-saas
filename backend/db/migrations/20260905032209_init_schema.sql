-- migrate:up
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'public', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

--
-- Name: enum_roles_scope; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_roles_scope AS ENUM (
    'platform',
    'organization',
    'project',
    'team'
);


--
-- Name: enum_permissions_scope; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_permissions_scope AS ENUM (
    'organization',
    'project',
    'team'
);


--
-- Name: enum_tasks_priority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_tasks_priority AS ENUM (
    'low',
    'medium',
    'high'
);


--
-- Name: enum_tasks_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_tasks_status AS ENUM (
    'to-do',
    'in-progress',
    'completed'
);


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX users_username_lower_idx ON public.users (lower(username));
CREATE UNIQUE INDEX users_email_lower_idx ON public.users (lower(email));


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_profiles (
    user_id uuid PRIMARY KEY REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    full_name character varying(30) NOT NULL,
    avatar text NOT NULL,
    cover_image text,
    bio text,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name character varying(30) NOT NULL,
    created_by uuid REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE,
    name character varying(30) NOT NULL,
    slug character varying(30) NOT NULL,
    scope public.enum_roles_scope NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX roles_org_slug_idx ON public.roles (organization_id, slug);
CREATE UNIQUE INDEX roles_org_name_idx ON public.roles (organization_id, name);
CREATE UNIQUE INDEX roles_id_org_idx ON public.roles (id, organization_id);


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name character varying(20) NOT NULL UNIQUE,
    description character varying(150),
    scope public.enum_permissions_scope NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: teams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teams (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE,
    name character varying(20) NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT teams_org_name_key UNIQUE (organization_id, name)
);

CREATE UNIQUE INDEX teams_id_org_idx ON public.teams (id, organization_id);


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE,
    name character varying(30) NOT NULL,
    description character varying(250) NOT NULL,
    is_archived boolean NOT NULL DEFAULT false,
    created_by uuid REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT projects_org_name_key UNIQUE (organization_id, name)
);

CREATE UNIQUE INDEX projects_id_org_idx ON public.projects (id, organization_id);


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    name character varying(20) NOT NULL,
    description character varying(250) NOT NULL,
    assigned_team uuid,
    assigned_user uuid,
    created_by uuid REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    priority public.enum_tasks_priority,
    status public.enum_tasks_status,
    due_date timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id, organization_id) REFERENCES public.projects(id, organization_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (assigned_team, organization_id) REFERENCES public.teams(id, organization_id) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (assigned_user) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL
);


--
-- Name: task_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id uuid NOT NULL REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    comment character varying(250) NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: organization_memberships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organization_memberships (
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    role_id uuid NOT NULL REFERENCES public.roles(id) ON UPDATE CASCADE,
    joined_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (organization_id, user_id)
);


--
-- Name: project_memberships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_memberships (
    project_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    user_id uuid NOT NULL REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    role_id uuid NOT NULL REFERENCES public.roles(id) ON UPDATE CASCADE,
    team_id uuid,
    joined_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, user_id),
    FOREIGN KEY (project_id, organization_id) REFERENCES public.projects(id, organization_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (team_id, organization_id) REFERENCES public.teams(id, organization_id) ON UPDATE CASCADE ON DELETE SET NULL
);


--
-- Name: team_memberships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_memberships (
    team_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    user_id uuid NOT NULL REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    role_id uuid NOT NULL REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE,
    joined_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (team_id, user_id),
    FOREIGN KEY (team_id, organization_id) REFERENCES public.teams(id, organization_id) ON UPDATE CASCADE ON DELETE CASCADE
);


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_permissions (
    role_id uuid NOT NULL REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE,
    permission_id uuid NOT NULL REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);


--
-- Triggers for updated_at
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON public.permissions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_task_comments_updated_at BEFORE UPDATE ON public.task_comments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_organization_memberships_updated_at BEFORE UPDATE ON public.organization_memberships FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_project_memberships_updated_at BEFORE UPDATE ON public.project_memberships FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_team_memberships_updated_at BEFORE UPDATE ON public.team_memberships FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_role_permissions_updated_at BEFORE UPDATE ON public.role_permissions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- migrate:down

-- 1. Drop Triggers
DROP TRIGGER IF EXISTS update_role_permissions_updated_at ON public.role_permissions;
DROP TRIGGER IF EXISTS update_team_memberships_updated_at ON public.team_memberships;
DROP TRIGGER IF EXISTS update_project_memberships_updated_at ON public.project_memberships;
DROP TRIGGER IF EXISTS update_organization_memberships_updated_at ON public.organization_memberships;
DROP TRIGGER IF EXISTS update_task_comments_updated_at ON public.task_comments;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
DROP TRIGGER IF EXISTS update_teams_updated_at ON public.teams;
DROP TRIGGER IF EXISTS update_permissions_updated_at ON public.permissions;
DROP TRIGGER IF EXISTS update_roles_updated_at ON public.roles;
DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;

-- 2. Drop Trigger Function
DROP FUNCTION IF EXISTS public.set_updated_at();

-- 3. Drop Tables in Reverse Dependency Order
DROP TABLE IF EXISTS public.role_permissions;
DROP TABLE IF EXISTS public.team_memberships;
DROP TABLE IF EXISTS public.project_memberships;
DROP TABLE IF EXISTS public.organization_memberships;
DROP TABLE IF EXISTS public.task_comments;
DROP TABLE IF EXISTS public.tasks;
DROP TABLE IF EXISTS public.projects;
DROP TABLE IF EXISTS public.teams;
DROP TABLE IF EXISTS public.roles;
DROP TABLE IF EXISTS public.permissions;
DROP TABLE IF EXISTS public.organizations;
DROP TABLE IF EXISTS public.user_profiles;
DROP TABLE IF EXISTS public.users;

-- 4. Drop Types (Matching Exact Up-Migration Type Names)
DROP TYPE IF EXISTS public.enum_tasks_status;
DROP TYPE IF EXISTS public.enum_tasks_priority;
DROP TYPE IF EXISTS public.enum_permissions_scope;
DROP TYPE IF EXISTS public.enum_roles_scope;

-- 5. Drop Extension (Optional)
DROP EXTENSION IF EXISTS pgcrypto;