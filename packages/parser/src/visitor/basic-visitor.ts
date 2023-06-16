import type { CstElement, CstNode } from 'chevrotain'
import { ZSCstParser } from '../cst-parser'
import type { ASTBasicProgram, ASTNode, ASTNodeFunction, ASTNodeGlobalStaticDeclare, ASTNodeParameter, ASTNodeParameterList, ASTNodeZenClass } from '../types/zs-ast'
import type { ClassDeclarationCstChildren, FunctionDeclarationCstChildren, GlobalStaticDeclarationCstChildren, IdentifierCstNode, ParameterCstChildren, ParameterListCstChildren, ProgramCstChildren } from '../types/zs-cst'

const BasicCstVisitor = ZSCstParser.getBaseCstVisitorConstructorWithDefaults()

class ZenScriptBasicVisitor extends BasicCstVisitor {
  constructor() {
    super()
    this.validateVisitor()
  }

  protected zsVisit<T extends ASTNode>(
    element: CstElement | CstNode | CstElement[] | CstNode[],
    position = false,
  ): T {
    if (Array.isArray(element))
      element = element[0] as CstNode
    else
      element = element as CstNode

    const node: T = this.visit(element as CstNode)

    if (position && element.location) {
      node.start = element.location.startOffset
      node.end = element.location.endOffset
    }

    return node
  }

  Program(ctx: ProgramCstChildren) {
    const program: ASTBasicProgram = {
      scopes: {},
      errors: [],
    }

    if (ctx.GlobalStaticDeclaration) {
      for (const declaration of ctx.GlobalStaticDeclaration) {
        const child: ASTNodeGlobalStaticDeclare = this.zsVisit(declaration)
        if (child.vName in program.scopes) {
          program.errors.push({
            start: child.start,
            end: child.end,
            message: `Duplicate ${child.type} variable of ${child.vName}`,
          })
          continue
        }
        program.scopes[child.vName] = child.type
      }
    }

    if (ctx.ClassDeclaration) {
      // TODO duplicate constructor / field / method check
      for (const declaration of ctx.ClassDeclaration) {
        const child: ASTNodeZenClass = this.zsVisit(declaration)
        if (child.cName in program.scopes) {
          program.errors.push({
            start: child.start,
            end: child.end,
            message: `Duplicate class of ${child.cName}`,
          })
          continue
        }
        program.scopes[child.cName] = child.type
      }
    }

    if (ctx.FunctionDeclaration) {
      // TODO duplicate parameter check
      for (const declaration of ctx.FunctionDeclaration) {
        const child: ASTNodeFunction = this.zsVisit(declaration)
        if (child.fName in program.scopes) {
          program.errors.push({
            start: child.start,
            end: child.end,
            message: `Duplicate function of ${child.fName}`,
          })
          continue
        }
        program.scopes[child.fName] = child.type
      }
    }

    return program
  }

  GlobalStaticDeclaration(ctx: GlobalStaticDeclarationCstChildren): ASTNodeGlobalStaticDeclare {
    return {
      start: ctx.GLOBAL ? ctx.GLOBAL[0].startOffset : ctx.STATIC![0].startOffset,
      end: ctx.SEMICOLON?.[0].endOffset ?? -1,
      type: ctx.GLOBAL ? 'global' : 'static',
      vName: ctx.vName[0].image,
      vType: {
        type: 'any',
        start: -1,
        end: -1,
      },
    }
  }

  FunctionDeclaration(ctx: FunctionDeclarationCstChildren): ASTNodeFunction {
    return {
      type: 'function',
      start: ctx.FUNCTION[0].startOffset,
      end: ctx.FunctionBody[0].location?.endOffset,
      fName: this.handleIdentifier(ctx.Identifier),
      fPara: ctx.ParameterList
        ? this.visit(ctx.ParameterList)
        : [],
      fType: {
        type: 'any',
        start: -1,
        end: -1,
      },
    }
  }

  ParameterList(ctx: ParameterListCstChildren): ASTNodeParameterList {
    return {
      type: 'parameter-list',
      start: ctx.Parameter ? (ctx.Parameter[0].location!.startOffset) : -1,
      end: ctx.Parameter ? (ctx.Parameter[ctx.Parameter.length - 1].location!.endOffset) : -1,
      pList: ctx.Parameter ? ctx.Parameter.map(item => this.visit(item)) : [],
    }
  }

  Parameter(ctx: ParameterCstChildren): ASTNodeParameter {
    const end = ctx.defaultValue
      ? ctx.defaultValue[0].location!.endOffset
      : ctx.TypeLiteral
        ? ctx.TypeLiteral[0].location!.endOffset
        : ctx.Identifier[0].location!.endOffset

    return {
      end,
      type: 'parameter',
      start: ctx.Identifier![0].location?.startOffset ?? -1,
      pName: this.handleIdentifier(ctx.Identifier),
      pType: {
        type: 'any',
        start: -1,
        end: -1,
      },
    }
  }

  ClassDeclaration(ctx: ClassDeclarationCstChildren): ASTNodeZenClass {
    return {
      type: 'class',
      start: ctx.ZEN_CLASS![0].startOffset,
      end: ctx.RCURLY![0].endOffset,
      cName: this.handleIdentifier(ctx.Identifier),
    }
  }

  handleIdentifier(identifier: IdentifierCstNode[]) {
    return identifier?.[0].children?.IDENTIFIER?.[0].image
      ?? identifier?.[0].children?.TO?.[0].image
      ?? 'unknown'
  }
}

export const ZSBasicVisitor = new ZenScriptBasicVisitor()
