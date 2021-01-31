import { BasePacket } from './BasePacket';

export interface FreeCompanyInfo extends BasePacket {
  fcId: number;
  fcRank: number;
}
