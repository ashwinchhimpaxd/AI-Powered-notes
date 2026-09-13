export const TASK_CONFIG = {
    editShort: {
        min: 800,
        max: 1800,
        ratio: 0.7,
        temperature: 0.3,
    },

    editStandard: {
        min: 1000,
        max: 2500,
        ratio: 1.4,
        temperature: 0.3,
    },

    generateShort: {
        min: 700,
        max: 1200,
        ratio: 0.5,
        temperature: 0.3,
    },

    generateStandard: {
        min: 900,
        max: 2000,
        ratio: 0.8,
        temperature: 0.3,
    },

    generateLong: {
        min: 1500,
        max: 4096,
        ratio: 1.2,
        temperature: 0.4,
    },
};

/**
 * Returns the ideal max_tokens for a given task based on input size.
 * Estimates input tokens as ~4 chars per token (standard approximation).
 *
 * @param {string} task        - Key from TASK_CONFIG (e.g. "generateLong")
 * @param {string} inputText   - The full prompt text sent to the model
 * @returns {{ max_tokens: number, temperature: number }}
 */
export function getMaxTokens(task, inputText) {
    console.log(inputText)
    const config = TASK_CONFIG[task] || TASK_CONFIG.editStandard;
    const inputTokens = Math.ceil((inputText?.length || 0) / 3);
    console.log(inputTokens)
    const calculated = Math.ceil(inputTokens * config.ratio);
    console.log(calculated)
    return {
        max_tokens: Math.min(config.max, Math.max(config.min, calculated)),
        temperature: config.temperature,
    };
}
