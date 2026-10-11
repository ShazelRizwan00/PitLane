import {
  RawDriver,
  RawConstructor,
  RawRace,
  RawResult,
  RawDriverStanding,
  RawConstructorStanding,
  Driver,
  Constructor,
  Race,
  RaceResult,
  DriverStanding,
  ConstructorStanding,
} from './types';

export function mapRawDriver(raw: RawDriver): Driver {
  const number = raw.permanentNumber ? parseInt(raw.permanentNumber, 10) : null;
  return {
    id: raw.driverId,
    code: raw.code || raw.familyName.slice(0, 3).toUpperCase(),
    number: Number.isNaN(number) ? null : number,
    givenName: raw.givenName,
    familyName: raw.familyName,
    fullName: `${raw.givenName} ${raw.familyName}`,
    nationality: raw.nationality,
    dateOfBirth: raw.dateOfBirth,
    url: raw.url,
  };
}

export function mapRawConstructor(raw: RawConstructor): Constructor {
  return {
    id: raw.constructorId,
    name: raw.name,
    nationality: raw.nationality,
    url: raw.url,
  };
}

export function mapRawRace(raw: RawRace): Race {
  const round = parseInt(raw.round, 10) || 1;
  const season = parseInt(raw.season, 10) || 2026;
  const time = raw.time || '12:00:00Z';
  const isoDateTime = `${raw.date}T${time}`;

  // A race is completed if its date/time has passed in UTC
  const raceTimestamp = new Date(isoDateTime).getTime();
  const isCompleted = !Number.isNaN(raceTimestamp) && raceTimestamp < Date.now();

  // Clean mismatched race names where data source combines wrong titles
  let raceName = raw.raceName;
  if (raceName === 'Bahrain Grand Prix in Malaysia' || (raw.Circuit.Location?.country === 'Malaysia' && raceName.includes('Bahrain'))) {
    raceName = 'Malaysian Grand Prix';
  }

  return {
    season,
    round,
    name: raceName,
    circuit: {
      id: raw.Circuit.circuitId,
      name: raw.Circuit.circuitName,
      locality: raw.Circuit.Location.locality,
      country: raw.Circuit.Location.country,
      lat: parseFloat(raw.Circuit.Location.lat) || 0,
      long: parseFloat(raw.Circuit.Location.long) || 0,
    },
    date: raw.date,
    time: raw.time,
    isoDateTime,
    isCompleted,
    hasSprint: Boolean(raw.Sprint),
    hasResults: Array.isArray(raw.Results) && raw.Results.length > 0,
    results: raw.Results?.map(mapRawResult),
  };
}

export function mapRawResult(raw: RawResult): RaceResult {
  const position = parseInt(raw.position, 10) || 0;
  const number = parseInt(raw.number, 10) || 0;
  const points = parseFloat(raw.points) || 0;
  const grid = parseInt(raw.grid, 10) || 0;
  const laps = parseInt(raw.laps, 10) || 0;

  const fastestRank = raw.FastestLap?.rank ? parseInt(raw.FastestLap.rank, 10) : undefined;

  return {
    number,
    position,
    positionText: raw.positionText,
    points,
    driver: mapRawDriver(raw.Driver),
    constructor: mapRawConstructor(raw.Constructor),
    grid,
    laps,
    status: raw.status,
    timeFormatted: raw.Time?.time || (raw.status !== 'Finished' ? raw.status : undefined),
    fastestLapRank: Number.isNaN(fastestRank) ? undefined : fastestRank,
    fastestLapTime: raw.FastestLap?.Time?.time,
  };
}

export function mapRawDriverStanding(raw: RawDriverStanding): DriverStanding {
  const fallbackConstructor: Constructor = {
    id: 'unknown',
    name: 'Independent',
    nationality: 'International',
  };
  const primaryConstructor = raw.Constructors[0] ? mapRawConstructor(raw.Constructors[0]) : fallbackConstructor;

  return {
    position: parseInt(raw.position, 10) || 0,
    positionText: raw.positionText,
    points: parseFloat(raw.points) || 0,
    wins: parseInt(raw.wins, 10) || 0,
    driver: mapRawDriver(raw.Driver),
    constructor: primaryConstructor,
  };
}

export function mapRawConstructorStanding(raw: RawConstructorStanding): ConstructorStanding {
  return {
    position: parseInt(raw.position, 10) || 0,
    positionText: raw.positionText,
    points: parseFloat(raw.points) || 0,
    wins: parseInt(raw.wins, 10) || 0,
    constructor: mapRawConstructor(raw.Constructor),
  };
}
