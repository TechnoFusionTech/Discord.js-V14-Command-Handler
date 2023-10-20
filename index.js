const fs = require('fs');
const { Client, GatewayIntentBits, Collection } = require('discord.js');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Create a new Collection for the commands
client.commands = new Collection();

// Read all command files from the 'commands' directory
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Loop through each file and set the commands to the client's command Collection
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    // Register all commands to all guilds the bot is connected to
    for (const guild of client.guilds.cache.values()) {
        await guild.commands.set(Array.from(client.commands.values()));
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    // Check if the command exists in the client's command Collection
    if (!client.commands.has(commandName)) return;

    try {
        await client.commands.get(commandName).execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

// Login to Discord with your app's token
client.login(process.env.token);
