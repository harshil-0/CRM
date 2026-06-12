import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PipelineStageDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty()
  order: number;
}

export class CreatePipelineDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ type: [PipelineStageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PipelineStageDto)
  stages: PipelineStageDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdatePipelineDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({ type: [PipelineStageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PipelineStageDto)
  stages?: PipelineStageDto[];
}
