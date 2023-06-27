import type { CstNode } from 'chevrotain'
import { ZSCstParser } from '../cst-parser'
import type {
  ASTBasicProgram, ASTNode, ASTNodeFunction, ASTNodeGlobalStaticDeclare, ASTNodeParameter,
  ASTNodeParameterList,
  ASTNodeVariableDeclare, ASTNodeZenClass, ASTNodeZenConstructor,
} from '../types/zs-ast'
import type {
  ClassDeclarationCstChildren, ConstructorDeclarationCstChildren, FunctionDeclarationCstChildren,
  GlobalStaticDeclarationCstChildren, ParameterCstChildren, ParameterListCstChildren,
  ProgramCstChildren, VariableDeclarationCstChildren,
} from '../types/zs-cst'
import { handleIdentifier } from './visitor-helper'

const BasicCstVisitor = ZSCstParser.getBaseCstVisitorConstructorWithDefaults()

export class ZenScriptBasicVisitor extends BasicCstVisitor {
  constructor() {
    super()
    this.validateVisitor()
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

  private program: ASTBasicProgram = {
    scopes: {},
    errors: [],
  }

  Program(ctx: ProgramCstChildren) {
    if (ctx.GlobalStaticDeclaration) {
      for (const declaration of ctx.GlobalStaticDeclaration) {
        const child: ASTNodeGlobalStaticDeclare = this.zsVisit(declaration)
        if (child.name in this.program.scopes) {
          this.program.errors.push({
            start: child.start,
            end: child.end,
            message: `Duplicate ${child.type} variable of ${child.name}`,
          })
          continue
        }
        this.program.scopes[child.name] = child.type
      }
    }

    if (ctx.FunctionDeclaration) {
      for (const declaration of ctx.FunctionDeclaration!) {
        const child: ASTNodeFunction = this.zsVisit(declaration)
        if (child.name in this.program.scopes) {
          this.program.errors.push({
            start: child.start,
            end: child.end,
            message: `Duplicate function of ${child.name}`,
          })
          continue
        }

        this.program.scopes[child.name] = child.type
      }
    }

    if (ctx.ClassDeclaration)
      this.handleClassDeclaration(ctx)

    return this.program
  }

  private handleClassDeclaration(ctx: ProgramCstChildren) {
    for (const declaration of ctx.ClassDeclaration!) {
      const child: ASTNodeZenClass = this.zsVisit(declaration)
      if (child.cName in this.program.scopes) {
        this.program.errors.push({
          start: child.start,
          end: child.end,
          message: `Duplicate class of ${child.cName}`,
        })
        continue
      }

      if (!declaration.children.classBody) {
        this.program.scopes[child.cName] = child.type
        continue
      }

      let constructorFlag = false
      // duplicate constructor / field / method checks
      const fieldMethodNames: Array<string> = []
      for (const bodyDeclaration of declaration.children.classBody) {
        this.zsVisit(bodyDeclaration)
        if (bodyDeclaration.name === 'ConstructorDeclaration') {
          if (!constructorFlag) {
            constructorFlag = !constructorFlag
          }
          else {
            this.program.errors.push({
              start: bodyDeclaration.location!.startOffset,
              end: bodyDeclaration.location!.endOffset,
              message: `Duplicate constructor of ${child.cName}`,
            })
          }
        }
        else {
          const name = handleIdentifier(bodyDeclaration.children.Identifier)
          if (fieldMethodNames.includes(name)) {
            this.program.errors.push({
              start: bodyDeclaration.location!.startOffset,
              end: bodyDeclaration.location!.endOffset,
              message: `Duplicate field or method of ${name}`,
            })
            continue
          }
          fieldMethodNames.push(name)
        }
      }

      this.program.scopes[child.cName] = child.type
    }
  }

  VariableDeclaration(ctx: VariableDeclarationCstChildren): ASTNodeVariableDeclare {
    return {
      start: 0,
      end: 0,
      type: ctx.VAL ? 'val' : 'var',
      name: handleIdentifier(ctx.Identifier),
      vType: {
        type: 'any',
        start: -1,
        end: -1,
      },
    }
  }

  GlobalStaticDeclaration(ctx: GlobalStaticDeclarationCstChildren): ASTNodeGlobalStaticDeclare {
    return {
      start: 0,
      end: 0,
      type: ctx.GLOBAL ? 'global' : 'static',
      name: ctx.vName[0].image,
    }
  }

  FunctionDeclaration(ctx: FunctionDeclarationCstChildren): ASTNodeFunction {
    return {
      type: 'function',
      start: 0,
      end: 0,
      name: handleIdentifier(ctx.Identifier),
      paramList: ctx.ParameterList
        ? this.visit(ctx.ParameterList)
        : [],
    }
  }

  ParameterList(ctx: ParameterListCstChildren): ASTNodeParameterList {
    // duplicate parameter check
    const parameters: Array<string> = []
    const params = ctx.Parameter ?? []

    if (params.length > 0) {
      for (const _param of params) {
        const paramName = handleIdentifier(_param.children.Identifier)
        if (parameters.includes(paramName)) {
          this.program.errors.push({
            start: _param.location!.startOffset,
            end: _param.location!.endOffset,
            message: `Duplicate parameter of ${paramName}`,
          })
          continue
        }
        parameters.push(paramName)
      }
    }

    return {
      type: 'parameter-list',
      start: 0,
      end: 0,
      params: ctx.Parameter ? ctx.Parameter.map(item => this.visit(item)) : [],
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
      name: handleIdentifier(ctx.Identifier),
    }
  }

  ClassDeclaration(ctx: ClassDeclarationCstChildren): ASTNodeZenClass {
    return {
      type: 'zen-class',
      start: 0,
      end: 0,
      cName: handleIdentifier(ctx.Identifier),
    }
  }

  ConstructorDeclaration(ctx: ConstructorDeclarationCstChildren): ASTNodeZenConstructor {
    return {
      type: 'zen-constructor',
      start: 0,
      end: 0,
      parameterList: ctx.ParameterList
        ? this.visit(ctx.ParameterList)
        : undefined,
    }
  }
}
