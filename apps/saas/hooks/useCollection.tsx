import useSWR from "swr";
import { jsonToGraphQLQuery } from "json-to-graphql-query";
import { Dimensions } from "@skylark-reference-apps/lib";
import {
  useDimensions,
  skylarkRequestWithDimensions,
} from "@skylark-reference-apps/react";

import { SkylarkSet } from "../types/gql";
import { createGraphQLQueryDimensions } from "../lib/utils";
import { GQLError } from "../types";

const createGraphQLQuery = (lookupValue: string, dimensions: Dimensions) => {
  const method = `getSkylarkSet`;

  // Helper to use the external_id when an airtable record ID is given
  const lookupField =
    lookupValue.startsWith("ingestor_set") ||
    lookupValue.startsWith("streamtv_")
      ? "external_id"
      : "uid";

  const queryAsJson = {
    query: {
      __name: method,
      [method]: {
        __args: {
          ignore_availability: true,
          [lookupField]: lookupValue,
          ...createGraphQLQueryDimensions(dimensions),
        },
        uid: true,
        title: true,
        title_short: true,
        synopsis: true,
        synopsis_short: true,
        release_date: true,
        ratings: {
          objects: {
            value: true,
          },
        },
        images: {
          objects: {
            title: true,
            type: true,
            url: true,
          },
        },
        content: {
          __args: {
            limit: 50,
          },
          next_token: true,
          objects: {
            object: {
              uid: true,
              slug: true,
              __typename: true,
            },
          },
        },
      },
    },
  };

  const query = jsonToGraphQLQuery(queryAsJson);

  return { query, method };
};

const getSetFetcher = ([lookupValue, dimensions]: [
  lookupValue: string,
  dimensions: Dimensions
]) => {
  const { query, method } = createGraphQLQuery(lookupValue, dimensions);
  return skylarkRequestWithDimensions<{ [key: string]: SkylarkSet }>(
    query,
    dimensions
  ).then(({ [method]: data }): SkylarkSet => data);
};

export const useCollection = (lookupValue: string) => {
  const { dimensions } = useDimensions();

  const { data, error, isLoading } = useSWR<SkylarkSet, GQLError>(
    [lookupValue, dimensions],
    getSetFetcher
  );

  return {
    collection: data,
    isLoading: isLoading && !data,
    isError: error,
  };
};
