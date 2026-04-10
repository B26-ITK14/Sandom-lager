// User hooks
export { useUsername, useFullName } from "./user/useName.ts";
export { useUserRole } from "./user/useUserRole.ts";

// Storage hooks
export { useInventory } from "./storage/useInventory";

// Auth hooks
export { useAuthenticatedFetch } from "./useAuthenticatedFetch";

// UI hooks
export { useEscapeKey } from "./ui/useEscapeKey";
export { useClickOutside } from "./ui/useClickOutside";

// Version hooks
export * from "./version/appVersion";
export * from "./version/appStability";
export * from "./version/appLastUpdated";

// Recipes domain hooks
export * from "./recipes/index";
