/**
 * Raw Ergast/Jolpica API Response Definitions
 */

export interface RawLocation {
  lat: string;
  long: string;
  locality: string;
  country: string;
}

export interface RawCircuit {
  circuitId: string;
  url?: string;
  circuitName: string;
  Location: RawLocation;
}

export interface RawDriver {
  driverId: string;
  permanentNumber?: string;
  code?: string;
  url?: string;
  givenName: string;
  familyName: string;
  dateOfBirth?: string;
  nationality: string;
}

export interface RawConstructor {
  constructorId: string;
  url?: string;
  name: string;
  nationality: string;
}

export interface RawSessionSchedule {
  date: string;
  time?: string;
}

export interface RawRace {
  season: string;
  round: string;
  url?: string;
  raceName: string;
  Circuit: RawCircuit;
  date: string;
  time?: string;
  FirstPractice?: RawSessionSchedule;
  SecondPractice?: RawSessionSchedule;
  ThirdPractice?: RawSessionSchedule;
  Qualifying?: RawSessionSchedule;
  Sprint?: RawSessionSchedule;
  SprintQualifying?: RawSessionSchedule;
  Results?: RawResult[];
}

export interface RawResultTime {
  millis?: string;
  time?: string;
}

export interface RawFastestLap {
  rank?: string;
  lap?: string;
  Time?: {
    time: string;
  };
  AverageSpeed?: {
    units: string;
    speed: string;
  };
}

export interface RawResult {
  number: string;
  position: string;
  positionText: string;
  points: string;
  Driver: RawDriver;
  Constructor: RawConstructor;
  grid: string;
  laps: string;
  status: string;
  Time?: RawResultTime;
  FastestLap?: RawFastestLap;
}

export interface RawDriverStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Driver: RawDriver;
  Constructors: RawConstructor[];
}

export interface RawConstructorStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Constructor: RawConstructor;
}

export interface RawRaceTable {
  season?: string;
  round?: string;
  Races?: RawRace[];
}

export interface RawStandingsList {
  season: string;
  round: string;
  DriverStandings?: RawDriverStanding[];
  ConstructorStandings?: RawConstructorStanding[];
}

export interface RawStandingsTable {
  season?: string;
  round?: string;
  StandingsLists?: RawStandingsList[];
}

export interface RawMRData {
  xmlns?: string;
  series?: string;
  url?: string;
  limit: string;
  offset: string;
  total: string;
  RaceTable?: RawRaceTable;
  StandingsTable?: RawStandingsTable;
}

export interface RawApiResponse {
  MRData: RawMRData;
}

/**
 * Domain Models for PitLane Dashboard
 */

export interface Driver {
  id: string;
  code: string;
  number: number | null;
  givenName: string;
  familyName: string;
  fullName: string;
  nationality: string;
  dateOfBirth?: string;
  url?: string;
}

export interface Constructor {
  id: string;
  name: string;
  nationality: string;
  url?: string;
}

export interface Circuit {
  id: string;
  name: string;
  locality: string;
  country: string;
  lat: number;
  long: number;
}

export interface Race {
  season: number;
  round: number;
  name: string;
  circuit: Circuit;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM:SSZ
  isoDateTime: string;
  isCompleted: boolean;
  hasSprint?: boolean;
  hasResults?: boolean;
  results?: RaceResult[];
}

export interface RaceResult {
  number: number;
  position: number;
  positionText: string;
  points: number;
  driver: Driver;
  constructor: Constructor;
  grid: number;
  laps: number;
  status: string;
  timeFormatted?: string;
  fastestLapRank?: number;
  fastestLapTime?: string;
}

export interface DriverStanding {
  position: number;
  positionText: string;
  points: number;
  wins: number;
  driver: Driver;
  constructor: Constructor;
}

export interface ConstructorStanding {
  position: number;
  positionText: string;
  points: number;
  wins: number;
  constructor: Constructor;
}

export interface StandingsSummary<T> {
  season: number;
  round: number;
  standings: T[];
}
