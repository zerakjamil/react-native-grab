/**
 * Babel plugin that wraps <Modal> children with <ReactNativeGrabModal>
 * so the grab overlay renders inside every modal in __DEV__ builds.
 */

const GRAB_MODAL_IMPORT_NAME = "ReactNativeGrabModal";
const GRAB_IMPORT_SOURCE = "react-native-grab";

module.exports = function reactNativeGrabBabelPlugin({ types: t }) {
  function fileAlreadyImports(path) {
    const program = path.findParent((p) => p.isProgram());
    if (!program) return false;

    return program.node.body.some(
      (stmt) =>
        t.isImportDeclaration(stmt) &&
        stmt.source.value === GRAB_IMPORT_SOURCE &&
        stmt.specifiers.some(
          (spec) =>
            t.isImportSpecifier(spec) &&
            t.isIdentifier(spec.imported) &&
            spec.imported.name === GRAB_MODAL_IMPORT_NAME,
        ),
    );
  }

  function getBindingSource(binding) {
    if (!binding) return null;
    const node = binding.path.node;
    if (!node) return null;

    if (t.isImportSpecifier(node)) {
      const parent = binding.path.parentPath.node;
      if (parent && t.isImportDeclaration(parent)) {
        return parent.source.value;
      }
    }

    return null;
  }

  return {
    name: "react-native-grab-babel",
    visitor: {
      Program: {
        enter(path, state) {
          state.grabImportInjected = false;
        },
      },

      ImportDeclaration(path, state) {
        if (state.grabImportInjected) return;
        if (path.node.source.value !== "react-native") return;

        const hasModal = path.node.specifiers.some(
          (spec) =>
            t.isImportSpecifier(spec) &&
            t.isIdentifier(spec.imported) &&
            spec.imported.name === "Modal",
        );

        if (!hasModal) return;

        state.grabImportInjected = true;

        if (fileAlreadyImports(path)) return;

        const program = path.findParent((p) => p.isProgram());
        if (!program) return;

        const importDecl = t.importDeclaration(
          [
            t.importSpecifier(
              t.identifier(GRAB_MODAL_IMPORT_NAME),
              t.identifier(GRAB_MODAL_IMPORT_NAME),
            ),
          ],
          t.stringLiteral(GRAB_IMPORT_SOURCE),
        );

        const { body } = program.node;
        let insertIdx = body.length;

        for (let i = 0; i < body.length; i++) {
          if (t.isImportDeclaration(body[i]) && body[i].source.value === "react-native") {
            insertIdx = i + 1;
          }
        }

        body.splice(insertIdx, 0, importDecl);
      },

      JSXElement(path) {
        const opening = path.node.openingElement;
        if (!t.isJSXIdentifier(opening.name) || opening.name.name !== "Modal") return;

        if (opening.selfClosing) return;

        const binding = path.scope.getBinding("Modal");
        if (!binding) return;

        const importSrc = getBindingSource(binding);
        if (importSrc !== "react-native") return;

        const wrapElement = t.jsxElement(
          t.jsxOpeningElement(
            t.jsxIdentifier(GRAB_MODAL_IMPORT_NAME),
            [
              t.jsxAttribute(
                t.jsxIdentifier("style"),
                t.jsxExpressionContainer(
                  t.objectExpression([
                    t.objectProperty(t.identifier("flex"), t.numericLiteral(1)),
                  ]),
                ),
              ),
            ],
            false,
          ),
          t.jsxClosingElement(t.jsxIdentifier(GRAB_MODAL_IMPORT_NAME)),
          path.node.children,
          false,
        );

        path.node.children = [wrapElement];
        path.node.openingElement.selfClosing = false;
      },
    },
  };
};
