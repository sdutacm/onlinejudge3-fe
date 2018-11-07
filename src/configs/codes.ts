const codes = {
  // Session 1XX
  100: 'You are not logged in',
  101: 'You have already logged in',
  102: 'Incorrect login name or password',
  103: 'You have been banned',

  // Verifications 2XX
  200: 'You do not have permission to operate',
  201: 'Request frequency limit exceeded',

  // Users 3XX
  300: 'You do not have permission to operate',
  301: 'The user does not exist',
  302: 'The user already exists',
  303: 'The username can not be empty or length limit exceeded',
  304: 'The password can not be empty or length limit exceeded',
  305: 'The nickname can not be empty or length limit exceeded',
  306: 'The email can not be empty or length limit exceeded',
  307: 'The email is invalid',
  308: 'The school length limit exceeded',
  309: 'The college length limit exceeded',
  310: 'The major length limit exceeded',
  311: 'The class length limit exceeded',
  312: 'The old password is incorrect',

  // Problems 4XX
  400: 'You do not have permission to operate',
  401: 'The problem does not exist',
  402: 'You do not have permission to view this problem',

  // Solutions 5XX
  500: 'You do not have permission to operate',
  501: 'The solution does not exist',
  502: 'You do not have permission to view this solution',
  503: 'The problem does not exist',
  504: 'You do not have permission to view this problem',
  505: 'The contest does not exist',
  506: 'You do not have permission to view this contest',
  507: 'The contest is not in progress',
  508: 'The language is invalid',
  509: 'The code can not be empty or length limit exceeded',
  510: 'You are not logged in',
  511: 'You have been banned',
  512: 'Submission frequency limit exceeded',

  // Contests 6XX
  600: 'You do not have permission to operate',
  601: 'The contest does not exist',
  602: 'You do not have permission to view this contest',
};

export default codes;
