import { FieldSet, Record, Table } from "airtable";
import axios, { AxiosError } from "axios";
import { Airtables } from "./interfaces";
import { getAllTables } from "./airtable";

jest.mock("axios");
jest.mock("./constants", () => ({
  AIRTABLE_API_KEY: "api-key",
  AIRTABLE_BASE_ID: "base-id",
}));

describe("airtable", () => {
  let mockedGet: jest.Mock;

  beforeEach(() => {
    mockedGet = axios.get as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllTables", () => {
    it("fetches all the known tables from Airtable", async () => {
      // Arrange.
      mockedGet.mockResolvedValue({ data: { records: [] } });
      const tables: Airtables = {
        mediaObjects: [],
        roles: [],
        people: [],
        credits: [],
        genres: [],
        themes: [],
        ratings: [],
        tags: [],
        images: [],
        availability: [],
        setsMetadata: [],
        assetTypes: [],
        imageTypes: [],
        tagTypes: [],
        translations: {
          mediaObjects: [],
        },
        dimensions: {
          affiliates: [],
          customerTypes: [],
          deviceTypes: [],
          languages: [],
          locales: [],
          operatingSystems: [],
          regions: [],
          viewingContext: [],
        },
      };

      // -1 as dimensions isn't a table
      const numTables =
        Object.keys(tables).length - 1 + Object.keys(tables.dimensions).length;

      // Act.
      await getAllTables("all");

      // Assert.
      expect(mockedGet).toBeCalledWith(
        "https://api.airtable.com/v0/base-id/affiliates?offset=",
        { headers: { Authorization: "Bearer api-key" } }
      );
      expect(mockedGet).toBeCalledTimes(numTables);
    });

    it("makes a subsequent table request when an offset is returned in the airtable response", async () => {
      // Arrange.
      mockedGet.mockResolvedValueOnce({
        data: { records: [], offset: "returnedoffset" },
      });
      const tables: Airtables = {
        mediaObjects: [],
        roles: [],
        people: [],
        credits: [],
        genres: [],
        themes: [],
        ratings: [],
        tags: [],
        images: [],
        availability: [],
        setsMetadata: [],
        assetTypes: [],
        imageTypes: [],
        tagTypes: [],
        translations: {
          mediaObjects: [],
        },
        dimensions: {
          affiliates: [],
          customerTypes: [],
          deviceTypes: [],
          languages: [],
          locales: [],
          operatingSystems: [],
          regions: [],
          viewingContext: [],
        },
      };

      // -1 as dimensions isn't a table
      const numTables =
        Object.keys(tables).length - 1 + Object.keys(tables.dimensions).length;

      // Act.
      await getAllTables("all");

      // Assert.
      expect(mockedGet).toBeCalledWith(
        "https://api.airtable.com/v0/base-id/affiliates?offset=returnedoffset",
        { headers: { Authorization: "Bearer api-key" } }
      );
      expect(mockedGet).toBeCalledTimes(numTables + 1); // +1 for offset call
    });

    it("returns the fields from records returned by Airtable", async () => {
      // Arrange.
      const fields: FieldSet[] = [
        { name: "record1", slug: "record-1" },
        { name: "record2", slug: "record-2" },
      ];
      const table = { name: "Media Content" } as Table<FieldSet>;
      const records: Partial<Record<FieldSet>>[] = [
        { fields: fields[0], _table: table },
        { fields: fields[1], _table: table },
      ];
      mockedGet.mockResolvedValue({ data: { records } });

      // Act.
      const data = await getAllTables("all");

      // Assert.
      expect(data.mediaObjects).toEqual(records);
    });

    it("filters out empty records", async () => {
      // Arrange.
      const fields: FieldSet[] = [
        { name: "record1", slug: "record-1" },
        {},
        { name: "record2", slug: "record-2" },
      ];
      const table = { name: "Media Content" } as Table<FieldSet>;
      const records: Partial<Record<FieldSet>>[] = [
        { fields: fields[0], _table: table },
        { fields: fields[1], _table: table },
        { fields: fields[2], _table: table },
      ];
      mockedGet.mockResolvedValue({ data: { records } });

      // Act.
      const data = await getAllTables("all");

      // Assert.
      expect(data.mediaObjects).toEqual([
        { fields: fields[0], _table: table },
        { fields: fields[2], _table: table },
      ]);
    });

    it("catches a 404 from Airtable, returns an empty array and logs a warn", async () => {
      // Arrange.
      // eslint-disable-next-line no-console
      console.warn = jest.fn();
      const mockedIsAxiosError = axios.isAxiosError as unknown as jest.Mock;
      mockedIsAxiosError.mockReturnValue(true);
      const err = {
        response: { status: 404 },
      } as AxiosError;

      mockedGet.mockRejectedValue(err);

      // Act.
      await getAllTables("all");

      // Assert.
      // eslint-disable-next-line no-console
      expect(console.warn).toBeCalledWith(
        `warn: Table "affiliates" does not exist`
      );
    });

    it("throws an error when the Axios response is not a 404", async () => {
      // Arrange.
      // eslint-disable-next-line no-console
      console.warn = jest.fn();
      const mockedIsAxiosError = axios.isAxiosError as unknown as jest.Mock;
      mockedIsAxiosError.mockReturnValue(true);
      const err = {
        response: { status: 500 },
      } as AxiosError;

      mockedGet.mockRejectedValue(err);

      // Act.
      await expect(getAllTables("all")).rejects.toEqual(err);
    });
  });
});
