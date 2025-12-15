/**
 * Data Types - Defines the contract for data flowing between nodes
 * These are the standardized types that nodes can produce/consume
 */
export const DataTypes = {
    /** Image data with a URL (blob or data URL) - { imageUrl: string } */
    IMAGE: 'image',
    /** Numeric value - { value: number } */
    NUMBER: 'number',
    /** Generic/any data - no validation */
    ANY: 'any',
}

/**
 * Data Schemas - Runtime validators for each data type
 * Each schema defines how to validate data and what fields are required
 */
export const DataSchemas = {
    [DataTypes.IMAGE]: {
        validate: (data) => data && typeof data.imageUrl === 'string' && data.imageUrl.length > 0,
        requiredFields: ['imageUrl'],
        description: 'Image data with a URL (blob or data URL)',
    },
    [DataTypes.NUMBER]: {
        validate: (data) => data && typeof data.value === 'number' && !isNaN(data.value),
        requiredFields: ['value'],
        description: 'Numeric value',
    },
    [DataTypes.ANY]: {
        validate: () => true, // Always valid
        requiredFields: [],
        description: 'Any data type (no validation)',
    },
}

/**
 * Helper to get a human-readable error message for invalid data
 * @param {string} expectedType - The expected DataType
 * @returns {string} - Error message
 */
export function getTypeErrorMessage(expectedType) {
    const schema = DataSchemas[expectedType]
    if (!schema) {
        return `Unknown data type: ${expectedType}`
    }
    return `Expected ${expectedType} data with fields: ${schema.requiredFields.join(', ')}`
}
