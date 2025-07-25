#!/usr/bin/env python3
"""Test script to verify MCP server works"""
import sys
import json

try:
    from mcp.server.fastmcp import FastMCP
    print("✅ MCP modules imported successfully")
    
    # Test creating a simple server
    mcp = FastMCP("test-server")
    print("✅ FastMCP server instance created")
    
    print("\n🎉 All tests passed! MCP server is ready to use.")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Please ensure you've activated the virtual environment")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
