import { graphQLClient } from "@skylark-reference-apps/lib";
import { renderHook, act } from "@testing-library/react-hooks";
import { useSWRConfig } from "swr";

import { useCollection } from "../../hooks/useCollection";

jest.spyOn(graphQLClient, "request");

describe("useCollection", () => {
  let graphQlRequest: jest.Mock;

  beforeEach(() => {
    graphQlRequest = graphQLClient.request as jest.Mock;

    const { result } = renderHook(useSWRConfig);
    act(() => {
      result.current.cache.clear();
    });

    jest.useFakeTimers();
    act(() => {
      jest.runAllTimers();
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("uses the external_id field to lookup the Set when the uid starts with ingestor_set (Airtable record ID)", async () => {
    graphQlRequest.mockResolvedValueOnce({ getSet: {} });

    const { waitForNextUpdate } = renderHook(() =>
      useCollection("ingestor_set_lskjdf")
    );

    await waitForNextUpdate();

    expect(graphQlRequest).toBeCalledWith(
      expect.stringContaining(
        `query getSet { getSet (ignore_availability: true, external_id: "ingestor_set_lskjdf"`
      )
    );
  });
});