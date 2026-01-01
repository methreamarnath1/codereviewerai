import inquirer from 'inquirer';
import chalk from 'chalk';
import { ConfigManager, AppConfig } from './manager.js';

export class ConfigWizard {
    private manager: ConfigManager;

    constructor() {
        this.manager = new ConfigManager();
    }

    /**
     * The main setup flow for a new user
     */
    async runSetup(): Promise<void> {
        console.log(chalk.cyan.bold('\n✨ codereviewer.ai Setup Wizard ✨'));
        console.log(chalk.gray('Let\'s configure your AI preferences.\n'));

        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'provider',
                message: 'Select your preferred AI Provider:',
                choices: [
                    { name: 'Google Gemini (Fast & Large Context)', value: 'gemini' },
                    { name: 'OpenAI (GPT-4o)', value: 'openai' },
                    { name: 'Anthropic (Claude 3.5 Sonnet)', value: 'claude' }
                ]
            },
            {
                type: 'password',
                name: 'apiKey',
                message: 'Enter your API Key:',
                mask: '*',
                validate: (input: string) => input.length > 0 || 'API Key is required.'
            },
            {
                type: 'list',
                name: 'reviewDepth',
                message: 'Default Review Depth:',
                choices: [
                    { name: 'Quick (Focus on critical bugs)', value: 'quick' },
                    { name: 'Deep (Full architectural analysis)', value: 'deep' }
                ]
            },
            {
                type: 'list',
                name: 'mode',
                message: 'Operation Mode:',
                choices: [
                    { name: 'Manual (Review when I run the command)', value: 'manual' },
                    { name: 'Auto (Review every time I save a file)', value: 'auto' }
                ]
            }
        ]);

        // Map models based on the provider chosen
        let defaultModel = 'gemini-1.5-pro';
        if (answers.provider === 'openai') defaultModel = 'gpt-4o';
        if (answers.provider === 'claude') defaultModel = 'claude-3-5-sonnet-20240620';

        // Save everything to the manager
        this.manager.setFullConfig({
            ...answers,
            model: defaultModel,
            includeContext: true,
            maxContextMessages: 10
        });

        console.log(chalk.green.bold('\n✅ Configuration successful!'));
        console.log(chalk.gray('You can now run ') + chalk.white.bold('awd review') + chalk.gray(' to start your first review.\n'));
    }

    /**
     * Allows reconfiguring a specific setting without a full reset
     */
    async reconfigure(type: 'provider' | 'mode'): Promise<void> {
        if (type === 'provider') {
            const { provider, apiKey } = await inquirer.prompt([
                { type: 'list', name: 'provider', message: 'New Provider:', choices: ['gemini', 'openai', 'claude'] },
                { type: 'password', name: 'apiKey', message: 'New API Key:' }
            ]);
            this.manager.setKey('provider', provider);
            this.manager.setKey('apiKey', apiKey);
        } else {
            const { mode } = await inquirer.prompt([
                { type: 'list', name: 'mode', message: 'Switch Mode:', choices: ['manual', 'auto'] }
            ]);
            this.manager.setKey('mode', mode);
        }
        console.log(chalk.green(`✅ ${type} updated successfully.`));
    }
}