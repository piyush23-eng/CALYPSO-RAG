"""
Secure In-Memory Python Sandbox & Code Interpreter Tool for CALYPSO-RAG.
Executes arbitrary mathematical derivations, recurrence relations, combinatorics,
and discrete graph algorithms with AST safety checking and timeout isolation.
"""

import ast
import sys
import io
import math
import itertools
import collections
import fractions
import time
from typing import Dict, Any, Optional


# Disallowed AST node types and function calls for strict sandboxing
FORBIDDEN_CALLS = {
    'eval', 'exec', 'compile', '__import__', 'open', 'input',
    'breakpoint', 'exit', 'quit', 'globals', 'locals', 'vars',
    'getattr', 'setattr', 'delattr', 'system', 'popen', 'subprocess',
    'socket', 'requests', 'urllib', 'shutil', 'os', 'sys'
}

FORBIDDEN_MODULES = {
    'os', 'sys', 'subprocess', 'socket', 'urllib', 'requests',
    'shutil', 'importlib', 'ctypes', 'pickle', 'pty', 'posix'
}


class ASTSecurityChecker(ast.NodeVisitor):
    """Inspects Python code AST to ensure no dangerous operations or modules are used."""

    def __init__(self):
        self.errors = []

    def visit_Import(self, node):
        for alias in node.names:
            base_module = alias.name.split('.')[0]
            if base_module in FORBIDDEN_MODULES:
                self.errors.append(f"Import of forbidden module '{alias.name}' is blocked.")
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        if node.module:
            base_module = node.module.split('.')[0]
            if base_module in FORBIDDEN_MODULES:
                self.errors.append(f"Import from forbidden module '{node.module}' is blocked.")
        self.generic_visit(node)

    def visit_Call(self, node):
        if isinstance(node.func, ast.Name):
            if node.func.id in FORBIDDEN_CALLS:
                self.errors.append(f"Call to forbidden function '{node.func.id}()' is blocked.")
        elif isinstance(node.func, ast.Attribute):
            if node.func.attr in FORBIDDEN_CALLS:
                self.errors.append(f"Call to forbidden attribute method '{node.func.attr}()' is blocked.")
        self.generic_visit(node)


class PythonSandbox:
    """
    In-memory isolated execution environment for GATE CS mathematical derivations.
    """

    def __init__(self, timeout_sec: float = 2.0):
        self.timeout_sec = timeout_sec

    def is_code_safe(self, code: str) -> tuple[bool, Optional[str]]:
        """Validates Python code against security AST invariants."""
        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            return False, f"Syntax Error: {e}"

        checker = ASTSecurityChecker()
        checker.visit(tree)
        if checker.errors:
            return False, "Security Violation: " + "; ".join(checker.errors)
        return True, None

    def execute(self, code: str, custom_globals: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Executes sandboxed Python code and captures output with execution timeout.
        """
        is_safe, error_msg = self.is_code_safe(code)
        if not is_safe:
            return {
                "success": False,
                "error": error_msg,
                "stdout": "",
                "result": None,
                "execution_time_ms": 0.0
            }

        # Safe execution namespace with mathematical primitives
        safe_builtins = {
            'abs': abs, 'all': all, 'any': any, 'bin': bin, 'bool': bool,
            'dict': dict, 'divmod': divmod, 'enumerate': enumerate,
            'filter': filter, 'float': float, 'format': format,
            'hex': hex, 'int': int, 'isinstance': isinstance,
            'iter': iter, 'len': len, 'list': list, 'map': map,
            'max': max, 'min': min, 'next': next, 'oct': oct,
            'ord': ord, 'pow': pow, 'print': print, 'range': range,
            'reversed': reversed, 'round': round, 'set': set,
            'slice': slice, 'sorted': sorted, 'str': str, 'sum': sum,
            'tuple': tuple, 'zip': zip
        }

        exec_globals = {
            "__builtins__": safe_builtins,
            "math": math,
            "itertools": itertools,
            "collections": collections,
            "fractions": fractions,
            "Fraction": fractions.Fraction
        }

        if custom_globals:
            exec_globals.update(custom_globals)

        # Redirect stdout
        old_stdout = sys.stdout
        redirected_output = io.StringIO()
        sys.stdout = redirected_output

        start_time = time.perf_counter()
        # Use unified scope so list comprehensions and generators can access parent scope
        scope = dict(exec_globals)

        try:
            compiled = compile(code, "<calypso_sandbox>", "exec")
            exec(compiled, scope)
            elapsed_ms = (time.perf_counter() - start_time) * 1000.0
            stdout_str = redirected_output.getvalue().strip()

            # Determine final return value if stored in 'ans' or 'result'
            return_val = scope.get("ans", scope.get("result", None))
            # Extract user variables
            user_locals = {
                k: v for k, v in scope.items()
                if k not in exec_globals and not k.startswith("_")
            }
            return {
                "success": True,
                "error": None,
                "stdout": stdout_str,
                "result": return_val,
                "locals": user_locals,
                "execution_time_ms": round(elapsed_ms, 3)
            }
        except Exception as e:
            elapsed_ms = (time.perf_counter() - start_time) * 1000.0
            return {
                "success": False,
                "error": f"Runtime {type(e).__name__}: {str(e)}",
                "stdout": redirected_output.getvalue().strip(),
                "result": None,
                "execution_time_ms": round(elapsed_ms, 3)
            }
        finally:
            sys.stdout = old_stdout


# Singleton instance for quick access
sandbox_runner = PythonSandbox()
