import type { CstNode } from 'chevrotain'
import { objectAssign } from '@zenscript-language-tools/shared'
import { ZSCstParser } from '../cst-parser'
import type {
  ASTError, ASTNode, ASTNodeFunction, ASTNodeGlobalStaticDeclare, ASTNodeParameter, ASTNodeParameterList,
  ASTNodeTypeLiteral,
  ASTNodeVariableDeclare,
  ASTNodeZenClass, ASTNodeZenConstructor, ASTProgram,
} from '../types/zs-ast'
import type {
  ClassDeclarationCstChildren, ConstructorDeclarationCstChildren,
  FunctionDeclarationCstChildren,
  GlobalStaticDeclarationCstChildren,
  ParameterCstChildren, ParameterListCstChildren, ProgramCstChildren, TypeLiteralCstChildren,
  VariableDeclarationCstChildren,
} from '../types/zs-cst'
import { getTypeLiteral, handleIdentifier } from './visitor-helper'

const BasicCstVisitor = ZSCstParser.getBaseCstVisitorConstructor()

export class ZenScriptVisitor extends BasicCstVisitor {
  public err: ASTError[] = []

  constructor() {
    super()
    // this.validateVisitor()
  }

  private zsVisitArray<T extends ASTNode<string>>(
    elements: CstNode[],
  ) {
    return elements.map(element => this.zsVisit(element)) as T[]
  }

  private zsVisit<T extends ASTNode<string>>(
    element: CstNode,
  ): T {
    const node: T = this.visit(element)

    if (element.location) {
      node.start = element.location.startOffset
      node.end = element.location.endOffset
    }

    return node
  }

  Program(ctx: ProgramCstChildren): ASTProgram {
    const program: ASTProgram = {
      body: [],
      start: 0,
      type: 'program',
    }

    if (ctx.ClassDeclaration) {
      const nodes = this.zsVisitArray(ctx.ClassDeclaration)
      program.body.push(...nodes)
    }

    return objectAssign(program, { end: program.body[program.body.length - 1].end })
  }

  Parameter(ctx: ParameterCstChildren): ASTNodeParameter {
    const pType = ctx.TypeLiteral && this.zsVisit(ctx.TypeLiteral[0])
    const defaultValue = ctx.defaultValue && this.zsVisit(ctx.defaultValue[0])
    const toReturn: ASTNodeParameter = {
      end: 0,
      start: 0,
      type: 'parameter',
      id: handleIdentifier(ctx.Identifier),
    }

    return objectAssign(toReturn, { defaultValue, pType })
  }

  GlobalStaticDeclaration(ctx: GlobalStaticDeclarationCstChildren): ASTNodeGlobalStaticDeclare {
    const value = ctx.value && this.zsVisit(ctx.value[0])
    const vType = ctx.TypeLiteral && this.zsVisit(ctx.TypeLiteral[0])

    const toReturn: ASTNodeGlobalStaticDeclare = {
      end: 0,
      start: 0,
      type: ctx.GLOBAL ? 'global' : 'static',
      id: handleIdentifier(ctx.Identifier),
    }

    return objectAssign(toReturn, { value, vType })
  }

  VariableDeclaration(ctx: VariableDeclarationCstChildren): ASTNodeVariableDeclare {
    const value = ctx.initializer && this.zsVisit(ctx.initializer[0])
    const vType = ctx.TypeLiteral && this.zsVisit(ctx.TypeLiteral[0])

    const toReturn: ASTNodeVariableDeclare = {
      end: 0,
      start: 0,
      type: ctx.VAL ? 'val' : 'var',
      id: handleIdentifier(ctx.Identifier),
    }

    return objectAssign(toReturn, { value, vType })
  }

  FunctionDeclaration(ctx: FunctionDeclarationCstChildren): ASTNodeFunction {
    const paramList = ctx.ParameterList && this.zsVisit<ASTNodeParameterList>(ctx.ParameterList[0])

    // TODO: I guess no many people will writing this type of code, so we need to try to infer it.
    const fType = ctx.returnType && this.zsVisit(ctx.returnType[0])

    const toReturn: ASTNodeFunction = {
      id: handleIdentifier(ctx.Identifier),
      type: 'function',
      start: 0,
      end: 0,
    }

    return objectAssign(toReturn, { paramList, fType })
  }

  ParameterList(ctx: ParameterListCstChildren): ASTNodeParameterList {
    const params = this.zsVisitArray<ASTNodeParameter>(ctx.Parameter)
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
        body: ctx.classBody ? this.zsVisitArray(ctx.classBody) : [],
      },
    }
  }

  ConstructorDeclaration(ctx: ConstructorDeclarationCstChildren): ASTNodeZenConstructor {
    const parameterList = ctx.ParameterList && this.zsVisit<ASTNodeParameterList>(ctx.ParameterList[0])
    const toReturn: ASTNodeZenConstructor = {
      end: 0,
      start: 0,
      type: 'zen-constructor',
    }

    return objectAssign(toReturn, { parameterList })
  }

  TypeLiteral(ctx: TypeLiteralCstChildren): ASTNodeTypeLiteral {
    const typeName = getTypeLiteral(ctx)

    const toReturn: ASTNodeTypeLiteral = {
      end: 0,
      start: 0,
      name: typeName,
      type: 'type-literal',
    }

    return toReturn
  }
}
