import type { CstNode, CstNodeLocation, IToken } from 'chevrotain'
import { objectAssign } from '@zenscript-language-tools/shared'
import { ZSCstParser } from '../cst-parser'
import type {
  ASTError, ASTNode, ASTNodeArrayType, ASTNodeAssignExpression, ASTNodeBinaryExpression, ASTNodeClassType, ASTNodeConditionalExpression, ASTNodeDExpandFunction, ASTNodeFunction, ASTNodeFunctionType, ASTNodeGlobalStaticDeclare,
  ASTNodeImport,
  ASTNodeListType,
  ASTNodeMapType,
  ASTNodeParameter, ASTNodeParameterList, ASTNodeQualifiedName, ASTNodeTypeLiteral, ASTNodeVariableDeclare,
  ASTNodeZenClass, ASTNodeZenConstructor, ASTProgram, FunctionId, PrimitiveType,
} from '../types/zs-ast'
import type {
  AddExpressionCstChildren,
  AndAndExpressionCstChildren, AndExpressionCstChildren, ArrayTypeCstChildren, AssignExpressionCstChildren, ClassDeclarationCstChildren, CompareExpressionCstChildren, ConditionalExpressionCstChildren,
  ConstructorDeclarationCstChildren,
  DExpandFunctionDeclarationCstChildren,
  ExpressionCstChildren,
  ExpressionStatementCstChildren, FunctionDeclarationCstChildren, FunctionTypeCstChildren, GlobalStaticDeclarationCstChildren, ImportDeclarationCstChildren, ListTypeCstChildren,
  MapTypeCstChildren,
  MultiplyExpressionCstChildren,
  OrExpressionCstChildren,
  OrOrExpressionCstChildren, ParameterCstChildren, ParameterListCstChildren, ProgramCstChildren,
  QualifiedNameCstChildren,
  StatementCstChildren,
  TypeLiteralCstChildren,
  UnaryExpressionCstChildren,
  VariableDeclarationCstChildren,
  XorExpressionCstChildren,
} from '../types/zs-cst'
import { getLastBody as getLastValue, getTypeLiteral, handleIdentifier, isPrimitiveType } from './visitor-helper'

const BasicCstVisitor = ZSCstParser.getBaseCstVisitorConstructor()

export class ZenScriptVisitor extends BasicCstVisitor {
  public err: ASTError[] = []

  constructor() {
    super()
    // this.validateVisitor()
  }

  private $zsVisitArray<T extends ASTNode<string>>(
    elements: CstNode[],
  ) {
    return elements.map(element => this.$zsVisit(element)) as T[]
  }

  private $zsVisit<T extends ASTNode<string>>(
    element: CstNode,
  ): T {
    const node: T = this.visit(element)

    if (element.location) {
      node.start = element.location.startOffset
      node.end = element.location.endOffset
    }

    return node
  }

  private $zsVisitWithArgs<T extends ASTNode<string>>(
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

  private $generateFunctionAst<
    T extends boolean = false,
    IS_EXPAND extends FunctionId = T extends true ? 'expand-function' : 'function',
  >(
    ctx: Pick<FunctionDeclarationCstChildren, 'ParameterList' | 'returnType' | 'Identifier'>,
    isDxpand?: T,
  ) {
    const paramList = ctx.ParameterList && this.$zsVisit<ASTNodeParameterList>(ctx.ParameterList[0])

    // TODO: I guess no many people will writing this type of code, so we need to try to infer it.
    const fType = ctx.returnType && this.$zsVisitWithArgs<ASTNodeTypeLiteral>(ctx.returnType[0], ctx.returnType[0].location)

    const toReturn: ASTNodeFunction<IS_EXPAND> = {
      id: handleIdentifier(ctx.Identifier),
      type: (isDxpand ? 'expand-function' : 'function') as IS_EXPAND,
      start: 0,
      end: 0,
    }

    return objectAssign(toReturn, { paramList, returnType: fType })
  }

  private $parseBinaryExpression(rules: CstNode[], operators?: IToken[]): ASTNodeBinaryExpression | ASTNode<string> {
    const first = this.$zsVisit(rules[0])
    if (!operators) {
      // operators undefined
      return first
    }

    let root: ASTNodeBinaryExpression = {
      type: 'binary-expression',
      start: first.start,
      end: -1,
      left: first,
      right: undefined,
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
          right: undefined,
          operator: '',
        }
      }
    })

    console.log({ root })
    return root
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
      const nodes = this.$zsVisitArray(ctx.ImportDeclaration)
      program.body.push(...nodes)
    }
    // if (ctx.GlobalStaticDeclaration) {
    //   const nodes = this.zsVisitArray(ctx.GlobalStaticDeclaration)
    //   program.body.push(...nodes)
    // }
    if (ctx.FunctionDeclaration) {
      const nodes = this.$zsVisitArray(ctx.FunctionDeclaration)
      program.body.push(...nodes)
    }
    if (ctx.DExpandFunctionDeclaration) {
      const nodes = this.$zsVisitArray(ctx.DExpandFunctionDeclaration)
      program.body.push(...nodes)
    }
    if (ctx.ClassDeclaration) {
      const nodes = this.$zsVisitArray(ctx.ClassDeclaration)
      program.body.push(...nodes)
    }
    if (ctx.Statement) {
      const node = this.$zsVisit(ctx.Statement[0])
      program.body.push(node)
      // const nodes = this.zsVisitArray(ctx.Statement)
      // program.body.push(...nodes)
    }

    return objectAssign(program, { end: program.body[program.body.length - 1].end })
  }

  QualifiedName(ctx: QualifiedNameCstChildren): ASTNodeQualifiedName {
    return {
      end: 0,
      start: 0,
      value: ctx.Identifier.map(item => handleIdentifier([item])),
      type: 'qualified-name',
    }
  }

  Parameter(ctx: ParameterCstChildren): ASTNodeParameter {
    const pType = ctx.TypeLiteral && this.$zsVisitWithArgs<ASTNodeTypeLiteral>(ctx.TypeLiteral[0], ctx.TypeLiteral[0].location)
    const defaultValue = ctx.defaultValue && this.$zsVisit(ctx.defaultValue[0])
    const toReturn: ASTNodeParameter = {
      end: 0,
      start: 0,
      type: 'parameter',
      id: handleIdentifier(ctx.Identifier),
    }

    return objectAssign(toReturn, { defaultValue, pType })
  }

  ImportDeclaration(ctx: ImportDeclarationCstChildren): ASTNodeImport {
    return {
      end: 0,
      start: 0,
      type: 'import',
      name: this.$zsVisit(ctx.QualifiedName[0]),
    }
  }

  GlobalStaticDeclaration(ctx: GlobalStaticDeclarationCstChildren): ASTNodeGlobalStaticDeclare {
    const value = ctx.value && this.$zsVisit(ctx.value[0])
    const vType = ctx.TypeLiteral && this.$zsVisitWithArgs<ASTNodeTypeLiteral>(ctx.TypeLiteral[0], ctx.TypeLiteral[0].location)

    const toReturn: ASTNodeGlobalStaticDeclare = {
      end: 0,
      start: 0,
      type: ctx.GLOBAL ? 'global' : 'static',
      id: handleIdentifier(ctx.Identifier),
    }

    return objectAssign(toReturn, { value, vType })
  }

  VariableDeclaration(ctx: VariableDeclarationCstChildren): ASTNodeVariableDeclare {
    const value = ctx.initializer && this.$zsVisit(ctx.initializer[0])
    const vType = ctx.TypeLiteral && this.$zsVisitWithArgs<ASTNodeTypeLiteral>(ctx.TypeLiteral[0], ctx.TypeLiteral[0].location)

    const toReturn: ASTNodeVariableDeclare = {
      end: 0,
      start: 0,
      type: ctx.VAL ? 'val' : 'var',
      id: handleIdentifier(ctx.Identifier),
    }

    return objectAssign(toReturn, { value, vType })
  }

  FunctionDeclaration(ctx: FunctionDeclarationCstChildren): ASTNodeFunction {
    return this.$generateFunctionAst(ctx)
  }

  DExpandFunctionDeclaration(ctx: DExpandFunctionDeclarationCstChildren): ASTNodeDExpandFunction {
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

  ClassDeclaration(ctx: ClassDeclarationCstChildren): ASTNodeZenClass {
    return {
      id: handleIdentifier(ctx.Identifier),
      start: 0,
      end: 0,
      type: 'zen-class',
      body: {
        start: ctx.LCURLY[0].startOffset + 1,
        end: ctx.RCURLY[0].startOffset - 1,
        type: 'class-body',
        body: ctx.classBody ? this.$zsVisitArray(ctx.classBody) : [],
      },
    }
  }

  ConstructorDeclaration(ctx: ConstructorDeclarationCstChildren): ASTNodeZenConstructor {
    const parameterList = ctx.ParameterList && this.$zsVisit<ASTNodeParameterList>(ctx.ParameterList[0])
    const toReturn: ASTNodeZenConstructor = {
      end: 0,
      start: 0,
      type: 'zen-constructor',
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
        getLastValue(value).value = toReturn
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
    return ctx.statement && this.$zsVisitArray(ctx.statement)
  }

  ExpressionStatement(ctx: ExpressionStatementCstChildren) {
    this.$zsVisitArray(ctx.Expression)
  }

  // ========================================
  // ===============Expression===============
  // ========================================

  Expression(ctx: ExpressionCstChildren) {
    return ctx.expression && this.$zsVisitArray(ctx.expression)
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

  ConditionalExpression(ctx: ConditionalExpressionCstChildren): ASTNodeConditionalExpression {
    // TODO: calculate start and end
    const node: ASTNodeConditionalExpression = {
      end: 0,
      start: 0,
      type: 'conditional-expression',
      condition: this.$zsVisit(ctx.OrOrExpression[0]),
    }

    // condition ? valid : invalid
    if (ctx.ConditionalExpression) {
      node.valid = this.$zsVisit(ctx.OrOrExpression[1])
      // TODO node.invalid =

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

  }
}
