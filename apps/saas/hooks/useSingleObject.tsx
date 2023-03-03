import useSWR from "swr";
import { jsonToGraphQLQuery } from "json-to-graphql-query";
import { Dimensions, GraphQLObjectTypes } from "@skylark-reference-apps/lib";
import {
  useDimensions,
  skylarkRequestWithDimensions,
} from "@skylark-reference-apps/react";
import { Brand, Episode, Movie, Season, Set } from "../types/gql";
import { createGraphQLQueryDimensions } from "../lib/utils";
import { GQLError } from "../types";

type ObjectType<T> = T extends "Episode"
  ? Episode
  : T extends "Movie"
  ? Movie
  : T extends "Brand"
  ? Brand
  : T extends "Season"
  ? Season
  : T extends "Set"
  ? Set
  : never;

const createGraphQLQuery = (
  type: GraphQLObjectTypes,
  lookupValue: string,
  dimensions: Dimensions
) => {
  // Helper to use the external_id when an airtable record ID is given
  const lookupField = lookupValue.startsWith("rec") ? "external_id" : "uid";

  const fieldsToFetch: { [key: string]: boolean | object } = {
    __typename: true,
    uid: true,
    title: true,
    slug: true,
    title_short: true,
    title_medium: true,
    title_long: true,
    synopsis_short: true,
    synopsis_medium: true,
    synopsis_long: true,
    release_date: true,
    images: {
      objects: {
        title: true,
        type: true,
        url: true,
      },
    },
  };

  if (["Episode", "Movie"].includes(type)) {
    fieldsToFetch.credits = {
      objects: {
        character: true,
        people: {
          objects: {
            name: true,
          },
        },
        roles: {
          objects: {
            title: true,
          },
        },
      },
    };
    fieldsToFetch.themes = {
      objects: {
        name: true,
      },
    };
    fieldsToFetch.genres = {
      objects: {
        name: true,
      },
    };
    fieldsToFetch.ratings = {
      objects: {
        value: true,
      },
    };
    fieldsToFetch.tags = {
      objects: {
        name: true,
      },
    };
    fieldsToFetch.assets = {
      objects: {
        uid: true,
        external_id: true,
        url: true,
      },
    };
  }

  if (type === "Episode") {
    fieldsToFetch.episode_number = true;
    fieldsToFetch.seasons = {
      objects: {
        season_number: true,
        title_short: true,
        title_medium: true,
        title_long: true,
        brands: {
          objects: {
            title_short: true,
            title_medium: true,
            title_long: true,
          },
        },
      },
    };
  }

  if (type === "Movie") {
    fieldsToFetch.brands = {
      objects: {
        title_short: true,
        title_medium: true,
        title_long: true,
      },
    };
  }

  if (type === "Brand") {
    fieldsToFetch.tags = {
      objects: {
        name: true,
      },
    };
    fieldsToFetch.ratings = {
      objects: {
        value: true,
      },
    };
    fieldsToFetch.seasons = {
      objects: {
        title_short: true,
        title_medium: true,
        title_long: true,
        season_number: true,
        number_of_episodes: true,
        episodes: {
          objects: {
            uid: true,
            episode_number: true,
          },
        },
      },
    };
  }

  if (type === "Set") {
    fieldsToFetch.type = true;
  }

  const method = `get${type}`;

  const queryAsJson = {
    query: {
      __name: method,
      [method]: {
        __args: {
          [lookupField]: lookupValue,
          ...createGraphQLQueryDimensions(dimensions),
        },
        ...fieldsToFetch,
      },
    },
  };

  const query = jsonToGraphQLQuery(queryAsJson);

  return { query, method };
};

const fetcher = <T extends GraphQLObjectTypes>([
  type,
  lookupValue,
  dimensions,
]: [type: T, lookupValue: string, dimensions: Dimensions]) => {
  const { query, method } = createGraphQLQuery(type, lookupValue, dimensions);
  return skylarkRequestWithDimensions<{ [key: string]: ObjectType<T> }>(
    query,
    dimensions
  ).then(({ [method]: data }): ObjectType<T> => data);
};

export const useSingleObject = <T extends GraphQLObjectTypes>(
  type: T,
  lookupValue: string
) => {
  const { dimensions } = useDimensions();

  const { data, error } = useSWR<ObjectType<T>, GQLError>(
    [type, lookupValue, dimensions],
    fetcher
  );

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  };
};
