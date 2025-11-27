#!/usr/bin/env node

/**
 * Test suite for Handsontable MCP Server
 * Tests all three tools with various queries
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

function log(color, prefix, message) {
  console.log(`${color}${prefix}${colors.reset} ${message}`);
}

function success(message) {
  log(colors.green, '✓', message);
}

function error(message) {
  log(colors.red, '✗', message);
}

function info(message) {
  log(colors.blue, 'ℹ', message);
}

function section(message) {
  console.log(`\n${colors.yellow}━━━ ${message} ━━━${colors.reset}\n`);
}

// Test cases
const tests = [
  {
    name: 'Search for "filter" keyword',
    tool: 'search_docs',
    args: { keyword: 'filter' },
    validate: (result) => {
      const text = result.content[0].text;
      return (
        text.includes('Search Results') &&
        text.includes('filter') &&
        !text.includes('No matches found')
      );
    },
  },
  {
    name: 'Search for "column" keyword',
    tool: 'search_docs',
    args: { keyword: 'column' },
    validate: (result) => {
      const text = result.content[0].text;
      return text.includes('Search Results') && text.includes('column');
    },
  },
  {
    name: 'Search for "validation" keyword',
    tool: 'search_docs',
    args: { keyword: 'validation' },
    validate: (result) => {
      const text = result.content[0].text;
      return text.includes('Search Results');
    },
  },
  {
    name: 'Search for non-existent topic',
    tool: 'search_docs',
    args: { keyword: 'xyznonexistent' },
    validate: (result) => {
      const text = result.content[0].text;
      return text.includes('No matches found') || text.includes('Found 0 matches');
    },
  },
  {
    name: 'List all categories',
    tool: 'list_categories',
    args: {},
    validate: (result) => {
      const text = result.content[0].text;
      return (
        text.includes('Documentation Categories') &&
        text.includes('Getting started') &&
        text.includes('Frameworks Available')
      );
    },
  },
  {
    name: 'Get JavaScript installation guide',
    tool: 'get_doc',
    args: { topic: 'installation', framework: 'javascript', type: 'guide' },
    validate: (result) => {
      const text = result.content[0].text;
      return (
        text.includes('Handsontable Documentation') &&
        text.includes('installation') &&
        text.length > 100
      );
    },
  },
  {
    name: 'Get React column-filter guide',
    tool: 'get_doc',
    args: { topic: 'column-filter', framework: 'react', type: 'guide' },
    validate: (result) => {
      const text = result.content[0].text;
      return text.includes('column-filter') && text.length > 100;
    },
  },
  {
    name: 'Get Core API reference',
    tool: 'get_doc',
    args: { topic: 'core', framework: 'javascript', type: 'api' },
    validate: (result) => {
      const text = result.content[0].text;
      return text.includes('core') && text.length > 100;
    },
  },
  {
    name: 'Get Angular demo guide',
    tool: 'get_doc',
    args: { topic: 'demo', framework: 'angular', type: 'guide' },
    validate: (result) => {
      const text = result.content[0].text;
      return text.includes('demo') && text.length > 100;
    },
  },
  {
    name: 'Get filters API reference',
    tool: 'get_doc',
    args: { topic: 'filters', framework: 'javascript', type: 'api' },
    validate: (result) => {
      const text = result.content[0].text;
      return text.includes('filters') && text.length > 100;
    },
  },
];

async function runTests() {
  console.log('\n' + colors.blue + '╔════════════════════════════════════════╗' + colors.reset);
  console.log(colors.blue + '║  Handsontable MCP Server Test Suite   ║' + colors.reset);
  console.log(colors.blue + '╚════════════════════════════════════════╝' + colors.reset);

  // Start the MCP server
  info('Starting MCP server...');

  const transport = new StdioClientTransport({
    command: 'node',
    args: ['index.js'],
  });

  const client = new Client(
    {
      name: 'test-client',
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  try {
    await client.connect(transport);
    success('Connected to MCP server');

    // Get available tools
    const toolsList = await client.listTools();
    info(`Found ${toolsList.tools.length} tools: ${toolsList.tools.map((t) => t.name).join(', ')}`);

    let passed = 0;
    let failed = 0;

    // Run each test
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      section(`Test ${i + 1}/${tests.length}: ${test.name}`);

      try {
        info(`Tool: ${test.tool}`);
        console.log(colors.gray + `Args: ${JSON.stringify(test.args, null, 2)}` + colors.reset);

        const startTime = Date.now();
        const result = await client.callTool({
          name: test.tool,
          arguments: test.args,
        });
        const duration = Date.now() - startTime;

        if (result.isError) {
          error(`Tool returned error: ${result.content[0].text}`);
          failed++;
          continue;
        }

        // Validate result
        const isValid = test.validate(result);

        if (isValid) {
          success(`PASSED (${duration}ms)`);
          passed++;

          // Show preview of response
          const preview = result.content[0].text.substring(0, 150).replace(/\n/g, ' ');
          console.log(colors.gray + `Preview: ${preview}...` + colors.reset);
        } else {
          error(`FAILED - Validation failed`);
          console.log(colors.gray + `Response: ${result.content[0].text.substring(0, 200)}` + colors.reset);
          failed++;
        }
      } catch (err) {
        error(`FAILED - ${err.message}`);
        console.error(err);
        failed++;
      }

      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Summary
    section('Test Summary');
    console.log(`Total tests: ${tests.length}`);
    console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
    console.log(`${colors.yellow}Success rate: ${((passed / tests.length) * 100).toFixed(1)}%${colors.reset}\n`);

    // Cleanup
    await client.close();

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    error(`Test suite failed: ${err.message}`);
    console.error(err);
    process.exit(1);
  }
}

runTests();
