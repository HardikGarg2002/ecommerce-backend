import fs from 'fs';
import { OrderStatus } from './common/type/order';
// import { OrderStatus } from './src/common/type/order';

// Generate the Swagger specification dynamically
export const generateSwaggerSpec = () => {
	try {
		// Read the OrderStatus enum values
		const orderStatusValues: string[] = Object.values(OrderStatus);

		const existingSwaggerSpec = fs.readFileSync('swagger.json', 'utf8');
		const swaggerSpec = JSON.parse(existingSwaggerSpec);
		swaggerSpec.definitions.OrderInput.properties.order_status.enum = orderStatusValues;
		// Write the generated Swagger specification to a file
		fs.writeFileSync('swagger.json', JSON.stringify(swaggerSpec, null, 2));
		console.log('Swagger specification generated successfully.');
	} catch (error) {
		console.error('Error generating Swagger specification:', error);
	}
};
