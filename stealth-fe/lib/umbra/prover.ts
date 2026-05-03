import {
  getCdnZkAssetProvider,
  getUserRegistrationProver,
  getCreateReceiverClaimableUtxoFromPublicBalanceProver,
  getCreateSelfClaimableUtxoFromPublicBalanceProver,
  getClaimReceiverClaimableUtxoIntoEncryptedBalanceProver,
  getClaimSelfClaimableUtxoIntoEncryptedBalanceProver,
  getClaimSelfClaimableUtxoIntoPublicBalanceProver,
  getCreateReceiverClaimableUtxoFromEncryptedBalanceProver,
} from "@umbra-privacy/web-zk-prover";
import type { ZkProverDeps } from "@umbra-privacy/web-zk-prover";

let _proverDeps: ZkProverDeps | null = null;

function getProverDeps(): ZkProverDeps {
  if (_proverDeps) return _proverDeps;
  const assetProvider = getCdnZkAssetProvider();
  _proverDeps = { assetProvider };
  return _proverDeps;
}

export function getRegistrationProver() {
  return getUserRegistrationProver(getProverDeps());
}

export function getReceiverUtxoFromPublicProver() {
  return getCreateReceiverClaimableUtxoFromPublicBalanceProver(getProverDeps());
}

export function getSelfUtxoFromPublicProver() {
  return getCreateSelfClaimableUtxoFromPublicBalanceProver(getProverDeps());
}

export function getReceiverUtxoFromEncryptedProver() {
  return getCreateReceiverClaimableUtxoFromEncryptedBalanceProver(
    getProverDeps()
  );
}

export function getClaimReceiverIntoEncryptedProver() {
  return getClaimReceiverClaimableUtxoIntoEncryptedBalanceProver(
    getProverDeps()
  );
}

export function getClaimSelfIntoEncryptedProver() {
  return getClaimSelfClaimableUtxoIntoEncryptedBalanceProver(getProverDeps());
}

export function getClaimSelfIntoPublicProver() {
  return getClaimSelfClaimableUtxoIntoPublicBalanceProver(getProverDeps());
}
