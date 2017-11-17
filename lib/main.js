const
log       = require('@superhero/debug').log,
container = {},
validate  =
{
  timestamp : (timestamp) =>
  {
    if(timestamp.split(' ').length != 5)
      throw 'invalid timestamp';

    return validate;
  },
  observer : (observer)  =>
  {
    if(observer != undefined && typeof observer != 'function')
      throw 'invalid observer type';

    return validate;
  }
},
schedule = module.exports =
{
  get: (timestamp) =>
    validate.timestamp(timestamp) && container[timestamp] || [],

  has: (timestamp, observer) =>
    validate.timestamp(timestamp).observer(observer) && observer
    ? !!~schedule.get(timestamp).indexOf(observer)
    : !! schedule.get(timestamp).length,

  add: (timestamp, observer) =>
    validate.timestamp(timestamp).observer(observer) && timestamp in container
    ? container[timestamp].push(observer)
    : container[timestamp] = [observer],

  remove: (timestamp, observer) =>
    validate.timestamp(timestamp).observer(observer) && observer
    ? schedule.has(timestamp, observer)
      && container[timestamp].splice(container[timestamp].indexOf(observer), 1)
    : delete container[timestamp]
},
loop = (last) =>
{
  const
  observers = [],
  now       = new Date();

  while(last.setMinutes(last.getMinutes() + 1) <= now)
    for(timestamp in container)
    {
      let [ year, month, day, hour, min
      ] = timestamp.split(' ').map(n => parseInt(n));

      if((isNaN(year)  || year   == last.getFullYear())
      && (isNaN(month) || month  == last.getMonth() + 1)
      && (isNaN(day)   || day    == last.getDate())
      && (isNaN(hour)  || hour   == last.getHours())
      && (isNaN(min)   || min    == last.getMinutes()))
      {
        log(`triggered ${timestamp}`);
        for(observer of container[timestamp])
          !~observers.indexOf(observer) && observers.push(observer);
      }
    }

  observers.forEach(observer => observer());

  const timeout = new Date(now).setMinutes(now.getMinutes() + 1) - Date.now();
  setTimeout(() => loop(now), timeout);
};

(() =>
{
  const timeout = new Date();
  timeout.setMinutes(timeout.getMinutes() + 1);
  timeout.setSeconds(0);

  setTimeout(() => loop(new Date()), timeout - Date.now());
})();
