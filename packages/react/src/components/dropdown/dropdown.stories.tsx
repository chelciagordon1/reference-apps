import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { within } from "@storybook/testing-library";
import { Dropdown } from "./dropdown.component";

export default {
  title: "React/Dropdown",
  component: Dropdown,
} as ComponentMeta<typeof Dropdown>;

const Template: ComponentStory<typeof Dropdown> = (args) => (
  <Dropdown {...args} />
);

export const Genre = Template.bind({});
Genre.args = {
  label: "Genres",
  items: [
    "Action & Adventure",
    "Children & Family",
    "Comedy",
    "Drama",
    "Horror",
    "Romantic",
    "Sci-fi & Fantasy",
    "Sports",
    "Thrillers",
    "TV Shows",
  ],
};

export const Themes = Template.bind({});
Themes.args = {
  label: "Themes",
  items: [
    "Love",
    "Redemption",
    "Resurrection",
    "Transformation",
    "Sacrifice",
    "Justice",
    "Innocence",
    "Vengeance",
  ],
};

export const Open = Template.bind({});
Open.args = {
  ...Themes.args,
};
Open.play = ({ canvasElement }) => {
  const canvas = within(canvasElement);
  canvas.getByRole("button").click();
};
