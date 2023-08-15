import type { CstNode, CstNodeLocation, IToken } from 'chevrotain'
import { objectAssign, objectOmit } from '@zenscript-language-tools/shared'
import { ZSCstParser } from '../cst-parser'
import type { ASTNode, ASTNodeArrayInitializerExpression, ASTNodeArrayType, ASTNodeAssignExpression, ASTNodeBinaryExpression, ASTNodeBlockStatement, ASTNodeBracketHandlerExpression, ASTNodeClassDeclaration, ASTNodeClassType, ASTNodeConditionalExpression, ASTNodeConstructorDeclaration, ASTNodeDExpandFunctionDeclaration, ASTNodeExpression, ASTNodeExpressionStatement, ASTNodeForeachStatement, ASTNodeFunctionDeclaration, ASTNodeFunctionType, ASTNodeIdentifier, ASTNodeIfStatement, ASTNodeImportDeclaration, ASTNodeLambdaFunctionDeclaration, ASTNodeListType, ASTNodeMapEntry, ASTNodeMapInitializerExpression, ASTNodeMapType, ASTNodeParameter, ASTNodeParameterList, ASTNodePostfixExpression, ASTNodePostfixExpressionFunctionCall, ASTNodePostfixExpressionMemberAccess, ASTNodePostfixExpressionRange, ASTNodePrimaryExpression, ASTNodeQualifiedName, ASTNodeReturnStatement, ASTNodeStatement, ASTNodeTypeLiteral, ASTNodeUnaryExpression, ASTNodeVariableDeclaration, ASTNodeWhileStatement, ASTProgram, ASTNodeAny, FunctionId, PrimitiveType } from '../types/zs-ast'
import type { AddExpressionCstChildren, AndAndExpressionCstChildren, AndExpressionCstChildren, ArrayInitializerExpressionCstChildren, ArrayTypeCstChildren, AssignExpressionCstChildren, BlockStatementCstChildren, BracketHandlerExpressionCstChildren, BreakStatementCstChildren, ClassDeclarationCstChildren, CompareExpressionCstChildren, ConditionalExpressionCstChildren, ConstructorDeclarationCstChildren, ContinueStatementCstChildren, DExpandFunctionDeclarationCstChildren, ExpressionCstChildren, ExpressionStatementCstChildren, ForeachStatementCstChildren, FunctionDeclarationCstChildren, FunctionTypeCstChildren, IdentifierCstChildren, IdentifierCstNode, IfStatementCstChildren, ImportDeclarationCstChildren, LambdaFunctionDeclarationCstChildren, ListTypeCstChildren, MapEntryCstChildren, MapInitializerExpressionCstChildren, MapTypeCstChildren, MultiplyExpressionCstChildren, OrExpressionCstChildren, OrOrExpressionCstChildren, ParameterCstChildren, ParameterListCstChildren, PostfixExpressionArrayCstChildren, PostfixExpressionCstChildren, PostfixExpressionFunctionCallCstChildren, PostfixExpressionMemberAccessCstChildren, PostfixExpressionRangeCstChildren, PrimaryExpressionCstChildren, ProgramCstChildren, QualifiedNameCstChildren, ReturnStatementCstChildren, StatementCstChildren, TypeLiteralCstChildren, UnaryExpressionCstChildren, VariableDeclarationCstChildren, WhileStatementCstChildren, XorExpressionCstChildren } from '../types/zs-cst'
import { getLastBody, getTypeLiteral, getTypeLiteralValue, isPrimitiveType } from './visitor-helper'

const BasicCstVisitor = ZSCstParser.getBaseCstVisitorConstructor()

export class ZenScriptVisitor extends BasicCstVisitor {
  constructor() {
    super()
    this.validateVisitor()
  }

  private $zsVisitArray<T extends ASTNodeAny>(
    elements: CstNode[],
  ) {
    return elements.map(element => this.$zsVisit(element)) as T[]
  }

  private $zsVisit<T extends ASTNodeAny>(
    element: CstNode,
  ): T {
    const node: T = this.visit(element)

    if (element?.location && node) {
      node.start = element.location.startOffset
      node.end = element.location.endOffset
    }

    return node
  }

  private $zsVisitWithArgs<T extends ASTNodeAny>(
    element: CstNode,
    ...args: any[]
  ): T {
    const node: T = this.visit(element, args)

    if (element.location && (node.start === 0)) {
      node.start = element.location.startOffset
      node.end = element.location.endOffset
    }

    return node
  }

  private $parseBinaryExpression(
    rules: CstNode[],
    operators?: IToken[],
  ): ASTNodeBinaryExpression | ASTNodePrimaryExpression {
    const first = this.$zsVisit<ASTNodePrimaryExpression>(rules[0])
    if (!operators) {
      // operators undefined
      return first
    }

    let root: ASTNodeBinaryExpression = {
      type: 'binary-expression',
      start: first.start,
      end: -1,
      left: first,
      right: undefined!,
      operator: '',
    }

    operators.forEach((op, i) => {
      root.operator = op.image
      root.right = this.$zsVisit(rules[i + 1])

      if (i === operators.length - 1) {
        // last item
        root.end = root.right.end
      }
      else {
        root = {
          type: 'binary-expression',
          start: root.left.start,
          end: -1,
          left: root,
          right: undefined!,
          operator: '',
        }
      }
    })

    return root
  }

  private $generateFunctionAst<
    T extends boolean = false,
    IS_EXPAND extends FunctionId = T extends true ? 'expand-function-declaration' : 'function-declaration',
  >(
    ctx: Pick<FunctionDeclarationCstChildren, 'ParameterList' | 'returnType' | 'Identifier' | 'functionBody'>,
    isDxpand?: T,
  ) {
    const paramList = ctx.ParameterList && this.$zsVisit<ASTNodeParameterList>(ctx.ParameterList[0])

    const returnType: ASTNodeTypeLiteral = ctx?.returnType
      ? this.$zsVisitWithArgs<ASTNodeTypeLiteral>(ctx.returnType[0], ctx.returnType[0].location)
      : {
          name: 'any',
          type: 'type-literal',
          start: -1,
          end: -1,
        }

    const toReturn: ASTNodeFunctionDeclaration<IS_EXPAND> = {
      end: 0,
      start: 0,
      returnType,
      type: (isDxpand ? 'expand-function-declaration' : 'function-declaration') as IS_EXPAND,
      id: ctx.Identifier?.[0] ? this.$zsVisit<ASTNodeIdentifier>(ctx.Identifier[0]).name : 'unknow',
      body: ctx?.functionBody
        ? this.$zsVisit<ASTNodeBlockStatement>(ctx.functionBody[0])
        : null,
    }

    return objectAssign(toReturn, { paramList })
  }

  // ========================================
  // ================Program=================
  // ========================================
  Program(ctx: ProgramCstChildren): ASTProgram {
    const program: ASTProgram = {
      body: [],
      start: 0,
      type: 'program',
    }

    /**
     * Import
     *  - global / static
     *  - function / $expand function
     *  - class
     *  - statement(expression / variable / etc.)
     */
    if (ctx.ImportDeclaration) {
      const nodes = this.$zsVisitArray<ASTNodeImportDeclaration>(ctx.ImportDeclaration)
      program.body.push(...nodes)
    }
    if (ctx.FunctionDeclaration) {
      const nodes = this.$zsVisitArray<ASTNodeFunctionDeclaration>(ctx.FunctionDeclaration)
      program.body.push(...nodes)
    }
    if (ctx.DExpandFunctionDeclaration) {
      const nodes = this.$zsVisitArray<ASTNodeDExpandFunctionDeclaration>(ctx.DExpandFunctionDeclaration)
      program.body.push(...nodes)
    }
    if (ctx.ClassDeclaration) {
      const nodes = this.$zsVisitArray<ASTNodeClassDeclaration>(ctx.ClassDeclaration)
      program.body.push(...nodes)
    }
    if (ctx.Statement) {
      const nodes = this.$zsVisitArray<ASTNodeStatement>(ctx.Statement)
      program.body.push(...nodes)
    }

    // checker normal error

    return objectAssign(program, { end: program.body[program.body.length - 1].end })
  }

  QualifiedName(ctx: QualifiedNameCstChildren): ASTNodeQualifiedName {
    return {
      end: 0,
      start: 0,
      type: 'qualified-name',
      ids: this.$zsVisitArray<ASTNodeIdentifier>(ctx.Identifier).map(item => item.name),
    }
  }

  Parameter(ctx: ParameterCstChildren): ASTNodeParameter {
    const pType = ctx.TypeLiteral && this.$zsVisitWithArgs<ASTNodeTypeLiteral>(ctx.TypeLiteral[0], ctx.TypeLiteral[0].location)
    const defaultValue = ctx.defaultValue && this.$zsVisit(ctx.defaultValue[0])
    const toReturn: ASTNodeParameter = {
      end: 0,
      start: 0,
      type: 'parameter',
      id: this.$zsVisit<ASTNodeIdentifier>(ctx.Identifier[0]).name,
    }

    return objectAssign(toReturn, { defaultValue, pType })
  }

  ImportDeclaration(ctx: ImportDeclarationCstChildren): ASTNodeImportDeclaration {
    return {
      end: 0,
      start: 0,
      type: 'import-declaration',
      name: this.$zsVisit(ctx.QualifiedName[0]),
    }
  }

  VariableDeclaration(ctx: VariableDeclarationCstChildren): ASTNodeVariableDeclaration {
    const value = ctx.initializer && this.$zsVisit(ctx.initializer[0])
    const vType = ctx.TypeLiteral && this.$zsVisitWithArgs<ASTNodeTypeLiteral>(ctx.TypeLiteral[0], ctx.TypeLiteral[0].location)

    const toReturn: ASTNodeVariableDeclaration = {
      end: 0,
      start: 0,
      type: 'variable-declaration',
      id: this.$zsVisit<ASTNodeIdentifier>(ctx.Identifier[0]).name,
      kind: ctx.kind![0].image as ASTNodeVariableDeclaration['kind'],
    }

    return objectAssign(toReturn, { value, vType })
  }

  FunctionDeclaration(ctx: FunctionDeclarationCstChildren): ASTNodeFunctionDeclaration {
    return this.$generateFunctionAst(ctx)
  }

  DExpandFunctionDeclaration(ctx: DExpandFunctionDeclarationCstChildren): ASTNodeDExpandFunctionDeclaration {
    const baseFunctionAst = this.$generateFunctionAst<true>(ctx, true)
    const expandType = this.$zsVisitWithArgs<ASTNodeTypeLiteral>(ctx.expandType[0], ctx.expandType[0].location)

    return {
      ...baseFunctionAst,
      expandType,
    }
  }

  ParameterList(ctx: ParameterListCstChildren): ASTNodeParameterList {
    const params = this.$zsVisitArray<ASTNodeParameter>(ctx.Parameter)
    const toReturn: ASTNodeParameterList = {
      end: 0,
      start: 0,
      params: [],
      type: 'parameter-list',
    }

    return objectAssign(toReturn, { params })
  }

  ClassDeclaration(ctx: ClassDeclarationCstChildren): ASTNodeClassDeclaration {
    return {
      end: 0,
      start: 0,
      type: 'class-declaration',
      id: this.$zsVisit<ASTNodeIdentifier>(ctx.Identifier[0]).name,
      body: ctx.classBody ? this.$zsVisitArray(ctx.classBody) : [],
    }
  }

  ConstructorDeclaration(ctx: ConstructorDeclarationCstChildren): ASTNodeConstructorDeclaration {
    const parameterList = ctx.ParameterList && this.$zsVisit<ASTNodeParameterList>(ctx.ParameterList[0])
    const toReturn: ASTNodeConstructorDeclaration = {
      end: 0,
      start: 0,
      type: 'constructor-declaration',
    }

    return objectAssign(toReturn, { parameterList })
  }

  TypeLiteral(ctx: TypeLiteralCstChildren, args: [CstNodeLocation]): ASTNodeTypeLiteral {
    const typeNames = getTypeLiteral(ctx)
    let value: ASTNodeTypeLiteral | undefined
    const typeLiteral: ASTNodeTypeLiteral = {
      end: args[0].endOffset,
      start: args[0].startOffset,
      type: 'type-literal',
      name: 'any',
    }

    const handleArrayType = () => {
      let astArray: ASTNodeArrayType | undefined
      for (let i = 0; i < ctx.arrayType!.length; i++) {
        if (i === 0)
          astArray = this.$zsVisitWithArgs<ASTNodeArrayType>(ctx.arrayType![i], args[0], ctx.arrayType![i].location)
        else
          astArray = this.$zsVisitWithArgs<ASTNodeArrayType>(ctx.arrayType![i], args[0], ctx.arrayType![i].location, astArray)
      }
      typeLiteral.name = 'array-type'
      return astArray
    }

    const handleMapType = () => {
      let astArray: ASTNodeMapType['value'] | undefined
      for (let i = 0; i < ctx.mapType!.length; i++)
        astArray = this.$zsVisitWithArgs<ASTNodeMapType>(ctx.mapType![0], args[0], ctx.mapType![i].location, astArray)

      typeLiteral.name = 'map-type'
      return astArray
    }

    const handleFunctionType = () => {
      return this.$zsVisit<ASTNodeFunctionType>(ctx.functionType![0])
    }

    const handleClassType = () => {
      const toReturn: ASTNodeClassType = {
        ...this.$zsVisit<ASTNodeQualifiedName>(ctx.classType![0]),
        name: 'class-type',
        type: 'type-literal',
      }

      return toReturn
    }

    const handleListType = () => {
      return this.$zsVisit<ASTNodeListType>(ctx.listType![0])
    }

    const handlePrimitiveType = (typeName: PrimitiveType) => {
      let toReturn: ASTNodeTypeLiteral = {
        end: args[0].startOffset + (typeName.length - 1),
        start: args[0].startOffset,
        name: typeName,
        type: 'type-literal',
      }

      if (value !== undefined) {
        getLastBody(value).value = toReturn
        toReturn = value
      }
      return toReturn
    }

    // array -> map -> (function -> class -> list) -> primitive
    for (const typeName of typeNames) {
      if (typeName === 'array-type')
        value = handleArrayType()
      else if (typeName === 'map-type')
        value ? (value.value = handleMapType()) : (value = handleMapType())
      else if (typeName === 'function-type')
        value ? (value.value = handleFunctionType()) : (value = handleFunctionType())
      else if (typeName === 'class-type')
        value ? (value.value = handleClassType()) : (value = handleClassType())
      else if (typeName === 'list-type')
        value ? (value.value = handleListType()) : (value = handleListType())
      else if (isPrimitiveType(typeName))
        value = handlePrimitiveType(typeName)
    }

    return isPrimitiveType(value!.name) ? value! : objectAssign(typeLiteral, value!)
  }

  ArrayType(
    _ctx: ArrayTypeCstChildren,
    args: [CstNodeLocation, CstNodeLocation, ASTNodeTypeLiteral],
  ): ASTNodeArrayType {
    const [base, cur, value] = args

    function handleEndOffset() {
      if (base.endOffset === cur.endOffset)
        return base.endOffset!
      else
        return cur.endOffset
    }

    function handleStartOffset() {
      return base.startOffset
    }

    return {
      value,
      name: 'array-type',
      type: 'type-literal',
      end: handleEndOffset(),
      start: handleStartOffset(),
    }
  }

  MapType(
    ctx: MapTypeCstChildren,
    args: [CstNodeLocation, CstNodeLocation, ASTNodeMapType['value']],
  ): ASTNodeMapType {
    const [base, cur, body] = args

    const key: ASTNodeTypeLiteral = ctx.key
      ? this.$zsVisitWithArgs<ASTNodeTypeLiteral>(ctx.key[0], ctx.key[0].location)
      : {
          end: -1,
          start: -1,
          type: 'type-literal',
          name: 'any',
        }

    function handleEndOffset() {
      if (base.endOffset === cur.endOffset)
        return base.endOffset!
      else
        return cur.endOffset
    }

    function handleStartOffset() {
      return base.startOffset
    }

    const toReturn: ASTNodeMapType = {
      key,
      name: 'map-type',
      value: undefined!,
      type: 'type-literal',
      end: handleEndOffset(),
      start: handleStartOffset(),
    }

    return objectAssign(toReturn, { key, value: body })
  }

  FunctionType(
    ctx: FunctionTypeCstChildren,
  ): ASTNodeFunctionType {
    const paramTypes = ctx.TypeLiteral ? ctx.TypeLiteral.map(ele => this.$zsVisitWithArgs(ele, ele.location)) : []
    const returnType: ASTNodeTypeLiteral = ctx.returnType
      ? this.$zsVisitWithArgs<ASTNodeTypeLiteral>(ctx.returnType[0], ctx.returnType[0].location)
      : {
          end: -1,
          start: -1,
          type: 'type-literal',
          name: 'any',
        }

    const toReturn: ASTNodeFunctionType = {
      end: 0,
      start: 0,
      returnType,
      paramTypes: [],
      type: 'type-literal',
      name: 'function-type',
    }

    return objectAssign(toReturn, { paramTypes, returnType })
  }

  ListType(
    ctx: ListTypeCstChildren,
  ): ASTNodeListType {
    const type: ASTNodeTypeLiteral = ctx.TypeLiteral
      ? this.$zsVisitWithArgs<ASTNodeTypeLiteral>(ctx.TypeLiteral[0], ctx.TypeLiteral[0].location)
      : {
          end: -1,
          start: -1,
          type: 'type-literal',
          name: 'any',
        }

    const toReturn: ASTNodeListType = {
      end: 0,
      start: 0,
      type: 'type-literal',
      name: 'list-type',
      value: type,
    }

    return objectAssign(toReturn, { value: type })
  }

  // ========================================
  // ===============Statement================
  // ========================================
  Statement(ctx: StatementCstChildren) {
    return ctx.statement && this.$zsVisit(ctx.statement[0])
  }

  BlockStatement(ctx: BlockStatementCstChildren): ASTNodeBlockStatement {
    return {
      end: 0,
      start: 0,
      type: 'block-statement',
      body: ctx.Statement ? this.$zsVisitArray(ctx.Statement) : [],
    }
  }

  ReturnStatement(ctx: ReturnStatementCstChildren): ASTNodeReturnStatement {
    return {
      end: 0,
      start: 0,
      type: 'return-statement',
      argument: ctx.Expression
        ? this.$zsVisit<ASTNodeExpression>(ctx.Expression[0])
        : null,
    }
  }

  BreakStatement(_ctx: BreakStatementCstChildren): ASTNode<'break-statement'> {
    return {
      end: 0,
      start: 0,
      type: 'break-statement',
    }
  }

  ContinueStatement(_ctx: ContinueStatementCstChildren): ASTNode<'continue-statement'> {
    return {
      end: 0,
      start: 0,
      type: 'continue-statement',
    }
  }

  IfStatement(ctx: IfStatementCstChildren): ASTNodeIfStatement {
    return {
      end: 0,
      start: 0,
      type: 'if-statement',
      test: this.$zsVisit(ctx.test[0]),
      consequent: this.$zsVisit(ctx.consequent[0]),
      alternate: ctx.alternate
        ? this.$zsVisit<ASTNodeIfStatement | ASTNodeBlockStatement>(ctx.alternate[0])
        : null,
    }
  }

  ForeachStatement(ctx: ForeachStatementCstChildren): ASTNodeForeachStatement {
    return {
      end: 0,
      start: 0,
      type: 'foreach-statement',
      left: this.$zsVisitArray(ctx.Identifier),
      right: this.$zsVisit(ctx.Expression[0]),
      body: ctx.BlockStatement
        ? this.$zsVisit<ASTNodeBlockStatement>(ctx.BlockStatement[0])
        : null,
    }
  }

  WhileStatement(ctx: WhileStatementCstChildren): ASTNodeWhileStatement {
    return {
      end: 0,
      start: 0,
      type: 'while-statement',
      test: this.$zsVisit(ctx.Expression[0]),
      body: ctx.BlockStatement
        ? this.$zsVisit<ASTNodeBlockStatement>(ctx.BlockStatement[0])
        : null,
    }
  }

  ExpressionStatement(ctx: ExpressionStatementCstChildren): ASTNodeExpressionStatement {
    return {
      start: 0,
      end: 0,
      type: 'expression-statement',
      expression: this.$zsVisit(ctx.Expression[0]),
    }
  }

  // ========================================
  // ===============Expression===============
  // ========================================

  Expression(ctx: ExpressionCstChildren) {
    return ctx.expression && this.$zsVisit(ctx.expression[0])
  }

  AssignExpression(ctx: AssignExpressionCstChildren): ASTNodeAssignExpression | ASTNodeConditionalExpression {
    const left = ctx.expression && this.$zsVisit<ASTNodeConditionalExpression>(ctx.expression[0])
    if (ctx.rightExpression) {
      const node: ASTNodeAssignExpression = {
        left,
        end: 0,
        start: 0,
        type: 'assign-expression',
        operator: ctx.operator![0].image,
        right: this.$zsVisit(ctx.rightExpression[0]),
      }
      return node
    }
    else {
      return left
    }
  }

  ConditionalExpression(
    ctx: ConditionalExpressionCstChildren,
  ): ASTNodeConditionalExpression | ASTNodeBinaryExpression {
    // TODO: calculate start and end
    const node: ASTNodeConditionalExpression = {
      end: 0,
      start: 0,
      type: 'conditional-expression',
      condition: this.$zsVisit<ASTNodeBinaryExpression>(ctx.conditionExpression[0]),
    }

    // condition ? valid : invalid
    if (ctx.invalidExpression) {
      node.valid = this.$zsVisit<ASTNodeBinaryExpression>(ctx.validExpression![0])
      node.invalid = this.$zsVisit<ASTNodeConditionalExpression>(ctx.invalidExpression[0])
      return node
    }
    else {
      return node.condition
    }
  }

  OrOrExpression(ctx: OrOrExpressionCstChildren) {
    return this.$parseBinaryExpression(ctx.AndAndExpression, ctx.operator)
  }

  AndAndExpression(ctx: AndAndExpressionCstChildren) {
    return this.$parseBinaryExpression(ctx.OrExpression, ctx.operator)
  }

  OrExpression(ctx: OrExpressionCstChildren) {
    return this.$parseBinaryExpression(ctx.XorExpression, ctx.operator)
  }

  XorExpression(ctx: XorExpressionCstChildren) {
    return this.$parseBinaryExpression(ctx.AndExpression, ctx.operator)
  }

  AndExpression(ctx: AndExpressionCstChildren) {
    return this.$parseBinaryExpression(ctx.CompareExpression, ctx.operator)
  }

  CompareExpression(ctx: CompareExpressionCstChildren) {
    return this.$parseBinaryExpression(ctx.AddExpression, ctx.operator)
  }

  AddExpression(ctx: AddExpressionCstChildren) {
    return this.$parseBinaryExpression(ctx.MultiplyExpression, ctx.operator)
  }

  MultiplyExpression(ctx: MultiplyExpressionCstChildren) {
    return this.$parseBinaryExpression(ctx.UnaryExpression, ctx.operator)
  }

  UnaryExpression(ctx: UnaryExpressionCstChildren) {
    const expression = this.$zsVisit<ASTNodeUnaryExpression | ASTNodePostfixExpression>(ctx.expression![0])

    if (ctx.operator) {
      return {
        start: 0,
        end: 0,
        expression,
        operator: ctx.operator[0].image,
        type: 'unary-expression',
      }
    }
    else {
      return expression
    }
  }

  PostfixExpression(ctx: PostfixExpressionCstChildren) {
    let primaryExpression = this.$zsVisit<ASTNodePostfixExpression>(ctx.PrimaryExpression[0])

    if (ctx.PostfixExpressionMemberAccess) {
      primaryExpression = ctx.PostfixExpressionMemberAccess.reduce((baseMember, node) =>
        this.$zsVisitWithArgs(node, [baseMember]), primaryExpression)
    }
    if (ctx.PostfixExpressionRange)
      primaryExpression = this.$zsVisitWithArgs(ctx.PostfixExpressionRange[0], [primaryExpression])
    if (ctx.PostfixExpressionArray) {
      primaryExpression = ctx.PostfixExpressionArray.reduce((baseMember, node) =>
        this.$zsVisitWithArgs(node, [baseMember]), primaryExpression)
    }
    if (ctx.PostfixExpressionFunctionCall) {
      primaryExpression = ctx.PostfixExpressionFunctionCall.reduce((baseMember, node) =>
        this.$zsVisitWithArgs(node, [baseMember]), primaryExpression)
    }
    if (ctx.AS) {
      return {
        end: 0,
        start: 0,
        operator: 'as',
        left: primaryExpression,
        type: 'binary-expression',
        right: this.$zsVisitWithArgs(ctx.asType![0], ctx.asType![0].location),
      } as ASTNodeBinaryExpression
    }
    if (ctx.INSTANCEOF) {
      return {
        end: 0,
        start: 0,
        operator: 'instanceof',
        left: primaryExpression,
        type: 'binary-expression',
        right: this.$zsVisitWithArgs(ctx.instanceofType![0], ctx.instanceofType![0].location),
      } as ASTNodeBinaryExpression
    }

    return primaryExpression
  }

  PostfixExpressionMemberAccess(
    ctx: PostfixExpressionMemberAccessCstChildren,
    args: [ASTNodeAssignExpression],
  ): ASTNodePostfixExpressionMemberAccess {
    return {
      start: 0,
      end: 0,
      type: 'postfix-expression-member-access',
      object: args[0],
      property: this.$zsVisit(ctx.Identifier[0]),
    }
  }

  PostfixExpressionFunctionCall(
    ctx: PostfixExpressionFunctionCallCstChildren,
    args: [ASTNodeAssignExpression],
  ): ASTNodePostfixExpressionFunctionCall {
    const toReturn: ASTNodePostfixExpressionFunctionCall = {
      end: 0,
      start: 0,
      callee: args[0],
      type: 'postfix-expression-function-call',
    }

    return objectAssign(toReturn, { args: ctx.argument && this.$zsVisitArray(ctx.argument) })
  }

  PostfixExpressionRange(
    ctx: PostfixExpressionRangeCstChildren,
    args: [ASTNodePostfixExpression],
  ): ASTNodePostfixExpressionRange {
    return {
      start: 0,
      end: 0,
      left: args[0],
      type: 'postfix-expression-range',
      right: this.$zsVisit(ctx.AssignExpression[0]),
    }
  }

  PostfixExpressionArray(
    ctx: PostfixExpressionArrayCstChildren,
    args: [ASTNodeAssignExpression],
  ): ASTNodeAssignExpression | ASTNodePostfixExpressionMemberAccess {
    if (ctx.value) {
      return {
        end: 0,
        start: 0,
        operator: '=',
        left: {
          type: 'postfix-expression-member-access',
          start: 0,
          end: 0,
          object: args[0],
          property: this.$zsVisit(ctx.index[0]),
        },
        type: 'assign-expression',
        right: this.$zsVisit(ctx.value[0]),
      }
    }
    else {
      return {
        end: 0,
        start: 0,
        object: args[0],
        property: this.$zsVisit(ctx.index[0]),
        type: 'postfix-expression-member-access',
      }
    }
  }

  PrimaryExpression(ctx: PrimaryExpressionCstChildren): ASTNodePrimaryExpression {
    if (ctx.literal) {
      const raw = ctx.literal[0].image
      return {
        raw,
        end: 0,
        start: 0,
        type: 'literal',
        value: getTypeLiteralValue(raw),
      }
    }
    else if (ctx.Identifier) {
      return this.$zsVisit(ctx.Identifier[0])
    }
    else if (ctx.BracketHandlerExpression) {
      return this.$zsVisit(ctx.BracketHandlerExpression[0])
    }
    else if (ctx.AssignExpression) {
      return this.$zsVisit(ctx.AssignExpression[0])
    }
    else if (ctx.LambdaFunctionDeclaration) {
      return this.$zsVisit(ctx.LambdaFunctionDeclaration[0])
    }
    else if (ctx.ArrayInitializerExpression) {
      return this.$zsVisit(ctx.ArrayInitializerExpression[0])
    }
    else {
      return this.$zsVisit(ctx.MapInitializerExpression![0])
    }
  }

  BracketHandlerExpression(ctx: BracketHandlerExpressionCstChildren): ASTNodeBracketHandlerExpression {
    return {
      start: 0,
      end: 0,
      type: 'bracket-handler-expression',
      parts: ctx.part!.map((item) => {
        if ((item as IdentifierCstNode)?.name === 'Identifier')
          return this.$zsVisit<ASTNodeIdentifier>(item as IdentifierCstNode).name
        return (item as IToken).image
      }),
    }
  }

  LambdaFunctionDeclaration(ctx: LambdaFunctionDeclarationCstChildren): ASTNodeLambdaFunctionDeclaration {
    const baseFunctionAst = objectOmit(this.$generateFunctionAst({ ...ctx, Identifier: [] }), ['id'])
    return {
      ...baseFunctionAst,
      type: 'lambda-function-declaration',
    }
  }

  ArrayInitializerExpression(ctx: ArrayInitializerExpressionCstChildren): ASTNodeArrayInitializerExpression {
    const toReturn: ASTNodeArrayInitializerExpression = {
      end: 0,
      start: 0,
      type: 'array-initializer-expression',
    }
    return objectAssign(toReturn, { elements: ctx.AssignExpression && this.$zsVisitArray(ctx.AssignExpression) })
  }

  MapInitializerExpression(ctx: MapInitializerExpressionCstChildren): ASTNodeMapInitializerExpression {
    const toReturn: ASTNodeMapInitializerExpression = {
      start: 0,
      end: 0,
      type: 'map-initializer-expression',
    }

    return objectAssign(toReturn, { entries: ctx.MapEntry && this.$zsVisitArray(ctx.MapEntry) })
  }

  MapEntry(ctx: MapEntryCstChildren): ASTNodeMapEntry {
    return {
      end: 0,
      start: 0,
      type: 'map-entry',
      key: this.$zsVisit(ctx.key[0]),
      value: this.$zsVisit(ctx.value[0]),
    }
  }

  Identifier(ctx: IdentifierCstChildren): ASTNodeIdentifier | string {
    const name = ctx?.IDENTIFIER?.[0]?.image ?? ctx?.TO?.[0]?.image ?? 'unknow'

    return {
      name,
      start: 0,
      type: 'identifier',
      end: 0,
    }
  }
}
