import { faker } from "@faker-js/faker";
import type { Node } from "@xyflow/react";

export const getNewNodeData = (): Node => {
  const id = crypto.randomUUID();

  return {
    id,
    position: { x: 0, y: 0 },
    data: { label: faker.food.fruit() },
  };
};
