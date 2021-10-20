const levels = {
  NONE: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

let level = levels.HIGH;

module.exports = {
  levels,
  setLevel: (l) => (level = l),
  log: {
    parameters: (parameters) => {
      if (levels.HIGH > level) return;
      console.group();
      parameters.forEach((p) => console.info(`${p.name}:`, p.value));
      console.groupEnd();
    },
    functionName: (name) => {
      if (levels.MEDIUM > level) return;
      console.info(`\nEXECUTING: ${name}\n`);
    },
    flow: (flow) => {
      if (levels.LOW > level) return;
      console.info(`\n\n\nBEGIN FLOW: ${flow}\n\n\n`);
    },
    variable: ({ name, value }) => {
      if (levels.HIGH > level) return;
      console.group();
      console.group();
      console.info(`VARIABLE ${name}:`, value);
      console.groupEnd();
      console.groupEnd();
    },
    request: () => (req, res, next) => {
      if (levels.HIGH > level) return next();
      console.info('Hit URL', req.url, 'with following:');
      console.group();
      console.info('Query:', req.query);
      console.info('Body:', req.body);
      console.groupEnd();
      return next();
    },
  },
};
