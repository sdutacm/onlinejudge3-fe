const langs = [
  {
    displayShortName: 'C',
    displayFullName: 'C (GCC 4.8.4)',
    fieldName: 'gcc',
  },
  {
    displayShortName: 'C++',
    displayFullName: 'C++ (G++ 4.8.4)',
    fieldName: 'g++',
  },
  {
    displayShortName: 'Java',
    displayFullName: 'Java 1.8.0',
    fieldName: 'java',
  },
  {
    displayShortName: 'Python 2',
    displayFullName: 'Python 2.7.6',
    fieldName: 'python2',
  },
  {
    displayShortName: 'Python 3',
    displayFullName: 'Python 3.6.1',
    fieldName: 'python3',
  },
  {
    displayShortName: 'C#',
    displayFullName: 'C# Mono 4.0.0.0',
    fieldName: 'c#',
  },
];

const langsMap = {};
for (const lang of langs) {
  langsMap[lang.fieldName] = lang;
}

export default langs;
export { langsMap };
