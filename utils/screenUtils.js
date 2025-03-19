import React from "react";
import EmptyScreen from "../components/EmptyScreen";
import BookDetailScreen from "../screens/user/BookDetailScreen";

/**
 * List of screens that are actually implemented
 * Add screens here as they are developed
 */
export const IMPLEMENTED_SCREENS = {
  // Auth screens
  Login: true,
  Register: true,
  ForgotPassword: true,
  VerifyCode: true,
  Chat: true,
  // User screens
  Home: true,
  BooksList: true,
  Profile: true,
  History: true,
  Settings: true,
  BookDetail: true,

  // Staff screens
  StaffLogin: true,
};

/**
 * Safe screen renderer - handles missing or invalid screen components
 * @param {Component} Component - The React component to render
 * @param {string} routeName - Name of the route for the EmptyScreen fallback
 * @returns {Function} - A component that is either the provided component or EmptyScreen
 */
export const safeScreen = (Component, routeName) => {
  console.log("safeScreen", routeName);
  // If screen is explicitly marked as implemented, use it
  if (IMPLEMENTED_SCREENS[routeName]) {
    return Component;
  }

  // If Component is undefined or null, return EmptyScreen
  if (!Component) {
    return (props) => <EmptyScreen routeName={routeName} />;
  }

  // Check if Component is a valid React component
  const isValidComponent = typeof Component === "function" || (Component.prototype && Component.prototype.isReactComponent);

  // If it's a default export with no content, it might have $$typeof undefined
  const hasContent = Component && Component.$$typeof !== undefined;

  return isValidComponent && hasContent ? Component : (props) => <EmptyScreen routeName={routeName} />;
};

/**
 * Import screen with error handling - provides a placeholder for screens that don't exist
 * @param {string} path - The import path (not actually used)
 * @param {string} fallbackName - Name to display in the EmptyScreen
 * @returns {Function} - EmptyScreen component with the given name
 */
export const importScreen = (path, fallbackName) => {
  // Always return EmptyScreen for now - this will be replaced with actual imports later
  return (props) => <EmptyScreen routeName={fallbackName} />;
};

/**
 * Creates a lazy-loaded screen component that will only import the actual screen when needed
 * @param {string} path - Path to the screen component
 * @param {string} screenName - Name of the screen
 * @returns {Function} - Component that will be loaded when needed
 */
export const createLazyScreen = (path, screenName) => {
  // This is for future use - currently returns EmptyScreen
  return (props) => <EmptyScreen routeName={screenName} />;

  // The future implementation would look like this:
  // const LazyComponent = React.lazy(() => import(path));
  // return (props) => (
  //   <React.Suspense fallback={<LoadingScreen />}>
  //     <LazyComponent {...props} />
  //   </React.Suspense>
  // );
};
