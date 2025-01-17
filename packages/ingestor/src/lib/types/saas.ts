import { GraphQLMediaObjectTypes } from "@skylark-reference-apps/lib";

export type ValidMediaObjectRelationships =
  | "themes"
  | "genres"
  | "tags"
  | "credits"
  | "ratings"
  | "images";

export type RelationshipsLink = { [key: string]: { link: string | string[] } };

export type SetRelationshipsLink = Omit<
  Record<
    GraphQLMediaObjectTypes | "SkylarkSet",
    { link: { position: number; uid: string }[] }
  >,
  "SkylarkAsset"
>;
