import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type ExampleDocument = HydratedDocument<Example>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
})
export class Example {
  @Prop({ type: String, required: true })
  text!: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  _owner!: Types.ObjectId;
}

export const ExampleSchema = SchemaFactory.createForClass(Example);

ExampleSchema.virtual('length').get(function (this: ExampleDocument) {
  return this.text.length;
});
