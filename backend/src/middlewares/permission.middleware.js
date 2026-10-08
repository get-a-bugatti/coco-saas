async function canUserPerformAction(
  userId,
  permissionName,
  resourceType,
  resourceId
) {
  if (resourceType === "ORGANIZATION") {
    const hasPermission = await db.oneOrNone(
      `
        SELECT 1 
        FROM organization_memberships om
        JOIN role_permissions rp ON om.permission_id = p.id
        WHERE om.user_id = $1 
          AND om.organization_id = $2 
          AND p.name = $3
      `,
      [userId, resourceId, permissionName]
    );

    return !!hasPermission;
  }

  if (resourceType === "PROJECT") {
    const hasPermission = await db.oneOrNone(
      `
        SELECT 1 
        FROM project_memberships pm
        JOIN permissions p ON pm.permission_id = p.id
        WHERE pm.user_id = $1 
          AND pm.project_id = $2 
          AND p.name = $3
      `,
      [userId, resourceId, permissionName]
    );

    return !!hasPermission;
  }

  return false;
}
