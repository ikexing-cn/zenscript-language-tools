import type { CstNode } from 'chevrotain'
import { objectAssign } from '@zenscript-language-tools/shared'
import { ZSCstParser } from '../cst-parser'
import type {
  ASTError, ASTNode, ASTNodeParameter, ASTNodeParameterList,
  ASTNodeZenClass, ASTNodeZenConstructor, ASTProgram,
} from '../types/zs-ast'
import type {
  ClassDeclarationCstChildren, ConstructorDeclarationCstChildren,
  ParameterCstChildren,
  ParameterListCstChildren, ProgramCstChildren,
} from '../types/zs-cst'
import { handleIdentifier } from './visitor-helper'

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
      const res = this.zsVisitArray(ctx.ClassDeclaration)
      program.body.push(...res)
    }

    return program
  }

  Parameter(ctx: ParameterCstChildren): ASTNodeParameter {
    const defaultValue = ctx.defaultValue && this.zsVisit(ctx.defaultValue[0])
    const toReturn: ASTNodeParameter = {
      end: 0,
      start: 0,
      type: 'parameter',
      name: handleIdentifier(ctx.Identifier),
    }

    return objectAssign(toReturn, { defaultValue })
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
    const classBody: ASTNode<string>[] = []

    if (ctx.ConstructorDeclaration)
      classBody.push(this.zsVisit(ctx.ConstructorDeclaration[0]))
    // else if (ctx.VariableDeclaration)
    //   body.push(...this.zsVisitArray(ctx.VariableDeclaration))
    // else if (ctx.FunctionDeclaration)
    //   body.push(...this.zsVisitArray(ctx.FunctionDeclaration))

    return {
      cName: handleIdentifier(ctx.Identifier),
      start: 0,
      end: 0,
      type: 'zen-class',
      body: {
        type: 'class-body',
        body: classBody,
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
}
