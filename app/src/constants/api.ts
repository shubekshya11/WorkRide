export const API_RIDES = '/rides';

export const API_RIDES_MATCH = `${API_RIDES}/match`;

export const API_RIDES_HISTORY = `${API_RIDES}/history`;

export const API_RIDES_FEEDBACK = `${API_RIDES}/feedback`;

export const API_RIDES_COMPLETE = `${API_RIDES}/:id/complete`;

export const API_USER_KARMA_POINTS = `${API_RIDES}/user/:userId/karma-points`;

export const API_USER_CREDIT_SCORE = `${API_RIDES}/user/:userId/credit-score`;

export const API_USER_AVERAGE_SCORE = `${API_RIDES}/user/:userId/average-score`;

export const API_USER_PEOPLE_IMPACTED = `${API_RIDES}/user/:userId/people-impacted`;

export const API_AUTH = '/auth';

export const API_AUTH_LOGIN = `${API_AUTH}/login`;

export const API_AUTH_SIGNUP = `${API_AUTH}/signup`;

export const API_AUTH_LOGOUT = `${API_AUTH}/logout`;

export const API_AUTH_REFRESH = `${API_AUTH}/refresh`;

export const API_AUTH_USER = `${API_AUTH}/user`;

export const API_AUTH_UPDATE = `${API_AUTH}/update`;

export const API_AUTH_CHANGE_PASSWORD = `${API_AUTH}/change-password`;
export const API_AUTH_ONBOARDING_STATUS = `${API_AUTH}/onboarding-status`;
export const API_AUTH_PROFILE = `${API_AUTH}/profile`;
export const API_AUTH_PROFILE_COMPLETENESS = `${API_AUTH}/profile-completeness`;

export const API_UPLOAD = '/upload';
export const API_RIDER_APPLICATIONS = '/rider-applications';
export const API_RIDER_APPLICATIONS_ME = `${API_RIDER_APPLICATIONS}/me`;

export const API_ADMIN_EMPLOYEES = '/admin/employees';
export const API_ADMIN_RIDER_APPLICATIONS = '/admin/rider-applications';

// Karma Redemption APIs
export const API_KARMA = '/karma';

export const API_KARMA_REWARDS = `${API_KARMA}/rewards`;

export const API_KARMA_REDEEM = `${API_KARMA}/redeem`;

export const API_KARMA_USER_REDEMPTIONS = `${API_KARMA}/user/:userId`;

export const API_KARMA_UPDATE_STATUS = `${API_KARMA}/:redemptionCode/status`;

// TODO: implement this API endpoint from server side for leaderboard
export const API_LEADERBOARD = '/leaderboard';
export const API_LEADERBOARD_TOP_RIDERS = `${API_LEADERBOARD}/riders`;
export const API_LEADERBOARD_TOP_KARMA = `${API_LEADERBOARD}/karma`;
export const API_LEADERBOARD_TOP_FEEDBACK = `${API_LEADERBOARD}/feedback`;
