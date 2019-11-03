import { inject as origInject } from 'mobx-react';

type StoreName = keyof MainStore;

/**
 * This function signature is heavily based on `withRouter` from `react-router`
 */
export function makeInject<SpecificStoreName extends StoreName>(
  storeName: SpecificStoreName,
): <
  PropType extends { [key in SpecificStoreName]: MainStore[SpecificStoreName] }
>(
  target: React.ComponentClass<PropType>,
) => React.ComponentClass<Omit<PropType, SpecificStoreName>> {
  type StoreType = { store: MainStore };
  type InjectedProps = {
    [key in SpecificStoreName]: MainStore[SpecificStoreName];
  };

  return origInject<StoreType, InjectedProps, InjectedProps, {}>(
    (allStores: StoreType) => {
      return {
        [storeName]: allStores.store[storeName],
      } as InjectedProps;
    },
  ) as any;
}

/** The serialized version of the MainStore's component stores */
export interface MainStoreData {}

/** A store to rule them all: top-level store */
export class MainStore {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-useless-constructor, @typescript-eslint/no-empty-function
  constructor(data: MainStoreData) {}
}

export type InjectedProps = {};
