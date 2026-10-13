import { BaseConnector } from './base.connector';
import { DataGovInConnector } from './datagov.connector';
import { AgmarknetConnector } from './agmarknet.connector';
import { EnamConnector } from './enam.connector';

export * from './base.connector';
export * from './datagov.connector';
export * from './agmarknet.connector';
export * from './enam.connector';

export class ConnectorRegistry {
  private static instance: ConnectorRegistry;
  private connectors: Map<string, BaseConnector> = new Map();

  private constructor() {
    this.register(new DataGovInConnector());
    this.register(new AgmarknetConnector());
    this.register(new EnamConnector());
  }

  static getInstance(): ConnectorRegistry {
    if (!ConnectorRegistry.instance) {
      ConnectorRegistry.instance = new ConnectorRegistry();
    }
    return ConnectorRegistry.instance;
  }

  register(connector: BaseConnector): void {
    this.connectors.set(connector.sourceId, connector);
  }

  get(sourceId: string): BaseConnector | undefined {
    return this.connectors.get(sourceId);
  }

  getAll(): BaseConnector[] {
    return Array.from(this.connectors.values());
  }

  async checkAllHealth() {
    return Promise.all(this.getAll().map(c => c.getHealthStatus()));
  }
}
