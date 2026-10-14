import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsNumber, IsString, Matches, ValidateNested } from 'class-validator';

export class TelemetryDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]{1,40}$/, { message: 'incubatorId solo admite letras, numeros, - y _' })
  incubatorId!: string;

  @IsNumber()
  temperature!: number;

  @IsNumber()
  humidity!: number;
}

export class TelemetryBatchDto {
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => TelemetryDto)
  items!: TelemetryDto[];
}
