import { Metadata } from "../../interfaces";

/**
 * getScheduleUrlsFromMetadata - returns an array of schedules using their Airtable IDs, defaults to the default schedule if none are found
 * @param schedules schedule IDs from Airtable
 * @param metadataSchedules object containing default schedule and all Airtable schedules added to Skylark
 * @returns array of Skylark schedules
 */
export const getScheduleUrlsFromMetadata = (
  schedules: string[],
  metadataSchedules: Metadata["schedules"]
): string[] => {
  const defaultSchedule: string[] = metadataSchedules.default
    ? [metadataSchedules.default.self]
    : [];
  const scheduleUrls =
    schedules && schedules.length > 0
      ? metadataSchedules.all
          .filter(({ airtableId: scheduleAirtableId }) =>
            schedules.includes(scheduleAirtableId)
          )
          .map(({ self }) => self)
      : defaultSchedule;
  return scheduleUrls;
};

/**
 * Removes undefined properties from an object
 * The TypeScript around this is a bit awkward because its designed to be generic
 * @param object - An object which may have properties that are undefined
 * @returns - An object that has no undefined keys
 */
export const removeUndefinedPropertiesFromObject = <T>(object: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}) => {
  Object.keys(object).forEach(
    // eslint-disable-next-line no-param-reassign
    (key) => object[key] === undefined && delete object[key]
  );
  return object as unknown as T;
};