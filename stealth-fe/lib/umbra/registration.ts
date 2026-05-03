import { getUserRegistrationFunction } from "@umbra-privacy/sdk";
import type { IUmbraClient } from "@umbra-privacy/sdk/interfaces";
import { getRegistrationProver } from "./prover";

export async function registerUser(client: IUmbraClient): Promise<void> {
  const register = getUserRegistrationFunction(
    { client },
    { zkProver: getRegistrationProver() }
  );
  await register();
}
