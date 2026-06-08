"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const DEFAULT_API_URL = "https://ayuastro.vercel.app";
const server = new index_js_1.Server({
    name: "ayuastro-mcp-server",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Define tools available
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "get_user_astrology_context",
                description: "Retrieves the user's computed astrological blueprint, planetary positions, birth details, active Yogas, and active Doshas.",
                inputSchema: {
                    type: "object",
                    properties: {
                        ucpToken: {
                            type: "string",
                            description: "The secret UCP authorization token copied from the user's settings profile."
                        },
                        apiUrl: {
                            type: "string",
                            description: "Optional custom API endpoint override. Defaults to the production URL."
                        }
                    },
                    required: ["ucpToken"]
                }
            },
            {
                name: "list_remedies_catalog",
                description: "Lists Vedic remedies, certified gemstones, temple pujas, and custom ritual offerings. Personalized recommendations are shown first if the user's UCP token is provided.",
                inputSchema: {
                    type: "object",
                    properties: {
                        ucpToken: {
                            type: "string",
                            description: "Optional secret UCP authorization token to personalize and sort remedies for this specific user."
                        },
                        apiUrl: {
                            type: "string",
                            description: "Optional custom API endpoint override. Defaults to the production URL."
                        }
                    }
                }
            },
            {
                name: "initiate_remedy_checkout",
                description: "Initiates a checkout transaction for a specific Vedic remedy or certified gemstone, returning a pending transaction log and a checkout link.",
                inputSchema: {
                    type: "object",
                    properties: {
                        ucpToken: {
                            type: "string",
                            description: "The secret UCP authorization token copied from the user's settings profile."
                        },
                        productId: {
                            type: "string",
                            description: "The unique ID of the product or remedy (e.g. mangal-dosha-puja, blue-sapphire)."
                        },
                        apiUrl: {
                            type: "string",
                            description: "Optional custom API endpoint override. Defaults to the production URL."
                        }
                    },
                    required: ["ucpToken", "productId"]
                }
            }
        ]
    };
});
// Call Tool handler
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const baseUrl = args?.apiUrl || DEFAULT_API_URL;
    try {
        if (name === "get_user_astrology_context") {
            const ucpToken = args?.ucpToken;
            if (!ucpToken) {
                throw new Error("Missing required argument: ucpToken");
            }
            const response = await fetch(`${baseUrl}/api/ucp/context`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${ucpToken}`,
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                const errText = await response.text();
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error fetching context (HTTP ${response.status}): ${errText}`
                        }
                    ],
                    isError: true
                };
            }
            const data = await response.json();
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(data, null, 2)
                    }
                ]
            };
        }
        if (name === "list_remedies_catalog") {
            const ucpToken = args?.ucpToken;
            const headers = {
                "Content-Type": "application/json"
            };
            if (ucpToken) {
                headers["Authorization"] = `Bearer ${ucpToken}`;
            }
            const response = await fetch(`${baseUrl}/api/ucp/catalog`, {
                method: "GET",
                headers
            });
            if (!response.ok) {
                const errText = await response.text();
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error fetching catalog (HTTP ${response.status}): ${errText}`
                        }
                    ],
                    isError: true
                };
            }
            const data = await response.json();
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(data, null, 2)
                    }
                ]
            };
        }
        if (name === "initiate_remedy_checkout") {
            const ucpToken = args?.ucpToken;
            const productId = args?.productId;
            if (!ucpToken || !productId) {
                throw new Error("Missing required arguments: ucpToken and productId");
            }
            const response = await fetch(`${baseUrl}/api/ucp/checkout`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${ucpToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ productId })
            });
            if (!response.ok) {
                const errText = await response.text();
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error initiating checkout (HTTP ${response.status}): ${errText}`
                        }
                    ],
                    isError: true
                };
            }
            const data = await response.json();
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(data, null, 2)
                    }
                ]
            };
        }
        throw new Error(`Tool not found: ${name}`);
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `MCP Tool Execution Error: ${error.message || error}`
                }
            ],
            isError: true
        };
    }
});
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("AyuAstro UCP/MCP Server connected via Stdio transport");
}
main().catch((error) => {
    console.error("Fatal MCP Server error:", error);
    process.exit(1);
});
