// saucedemo publishes these demo accounts on its own login page. They are not real credentials.
export type User = {
  username: string;
  password: string;
};

const DEMO_PASSWORD = 'secret_sauce';

export const users = {
  standard: { username: 'standard_user', password: DEMO_PASSWORD },
  lockedOut: { username: 'locked_out_user', password: DEMO_PASSWORD },
  problem: { username: 'problem_user', password: DEMO_PASSWORD },
  visual: { username: 'visual_user', password: DEMO_PASSWORD },
  wrongPassword: { username: 'standard_user', password: 'not_the_password' },
} satisfies Record<string, User>;

// Negative login cases: one row per scenario, like a Cucumber Scenario Outline "Examples" table.
export const invalidLogins: { scenario: string; user: User; error: string }[] = [
  {
    scenario: 'a locked-out user',
    user: users.lockedOut,
    error: 'Epic sadface: Sorry, this user has been locked out.',
  },
  {
    scenario: 'a wrong password',
    user: users.wrongPassword,
    error: 'Epic sadface: Username and password do not match any user in this service',
  },
  {
    scenario: 'an empty username',
    user: { username: '', password: DEMO_PASSWORD },
    error: 'Epic sadface: Username is required',
  },
  {
    scenario: 'an empty password',
    user: { username: users.standard.username, password: '' },
    error: 'Epic sadface: Password is required',
  },
];
