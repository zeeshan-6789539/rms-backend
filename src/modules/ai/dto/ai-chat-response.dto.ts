import { ApiProperty } from '@nestjs/swagger';

export class AiChatResponseDto {
  @ApiProperty({ example: 'Three tenants still owe rent this month: Ali Khan, Sara Ahmed and Bilal Raza.' })
  reply!: string;

  @ApiProperty({ type: [String], example: ['search_leases', 'get_lease_ledger'] })
  toolsUsed!: string[];
}
