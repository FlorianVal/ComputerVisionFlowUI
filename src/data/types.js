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

const VALID_COLOR_SPACES = new Set(['RGB', 'GRAY', 'HSV', 'LAB', 'YCrCb'])

export function createImageMetadata(overrides = {}) {
    return {
        colorSpace: 'RGB',
        channels: 3,
        ...overrides,
    }
}

export function createImagePayload({
    imageUrl,
    metadata,
    imageName,
    width,
    height,
} = {}) {
    return {
        imageUrl,
        metadata: createImageMetadata(metadata),
        ...(imageName ? { imageName } : {}),
        ...(typeof width === 'number' ? { width } : {}),
        ...(typeof height === 'number' ? { height } : {}),
    }
}

export function isImagePayload(data) {
    return Boolean(
        data &&
        typeof data.imageUrl === 'string' &&
        data.imageUrl.length > 0 &&
        data.metadata &&
        typeof data.metadata === 'object' &&
        VALID_COLOR_SPACES.has(data.metadata.colorSpace) &&
        typeof data.metadata.channels === 'number'
    )
}

/**
 * Data Schemas - Runtime validators for each data type
 * Each schema defines how to validate data and what fields are required
 */
export const DataSchemas = {
    [DataTypes.IMAGE]: {
        validate: isImagePayload,
        requiredFields: ['imageUrl', 'metadata'],
        description: 'Image payload with a URL and metadata',
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
