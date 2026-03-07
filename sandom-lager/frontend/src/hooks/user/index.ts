/*
    * index.ts
    * Centralized export of all user-related hooks, such as useUsername and useUserRole.
    * This file serves as a single entry point for importing user hooks across the frontend application, improving maintainability and organization.
*/

export { useUsername, useFirstName, useLastName, useFullName } from "./useName.ts";
export { useUserRole } from "./useUserRole.ts";
