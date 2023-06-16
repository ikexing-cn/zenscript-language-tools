import type { CstNode } from 'chevrotain'
import { ZSCstParser } from '../cst-parser'
import type {
  ASTBasicProgram, ASTNode, ASTNodeFunction, ASTNodeGlobalStaticDeclare, ASTNodeParameter,
  ASTNodeParameterList, ASTNodeVariableDDeclare, ASTNodeZenClass, ASTNodeZenConstructor,
} from '../types/zs-ast'
import type {
  ClassDeclarationCstChildren, ConstructorDeclarationCstChildren, FunctionDeclarationCstChildren,
  GlobalStaticDeclarationCstChildren, IdentifierCstNode, ParameterCstChildren, ParameterListCstChildren,
  ProgramCstChildren, VariableDeclarationCstChildren,
} from '../types/zs-cst'

const BasicCstVisitor = ZSCstParser.getBaseCstVisitorConstructorWithDefaults()

export class ZenScriptBasicVisitor extends BasicCstVisitor {
  constructor() {
    super()
    this.validateVisitor()
  }

  private zsVisit<T extends ASTNode>(
    element: CstNode,
  ): T {
    const node: T = this.visit(element)

    if (element.location) {
      node.start = element.location.startOffset
      node.end = element.location.endOffset
    }

    return node
  }

  private zsVisitArray(
    elements: CstNode[],
  ) {
    elements.forEach(element => this.zsVisit(element))
  }

  private program: ASTBasicProgram = {
    scopes: {},
    errors: [],
  }

  Program(ctx: ProgramCstChildren) {
    if (ctx.GlobalStaticDeclaration) {
      for (const declaration of ctx.GlobalStaticDeclaration) {
        const child: ASTNodeGlobalStaticDeclare = this.zsVisit(declaration)
        if (child.vName in this.program.scopes) {
          this.program.errors.push({
            start: child.start,
            end: child.end,
            message: `Duplicate ${child.type} variable of ${child.vName}`,
          })
          continue
        }
        this.program.scopes[child.vName] = child.type
      }
    }

    if (ctx.FunctionDeclaration) {
      for (const declaration of ctx.FunctionDeclaration!) {
        const child: ASTNodeFunction = this.zsVisit(declaration)
        if (child.fName in this.program.scopes) {
          this.program.errors.push({
            start: child.start,
            end: child.end,
            message: `Duplicate function of ${child.fName}`,
          })
          continue
        }

        this.program.scopes[child.fName] = child.type
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

      // duplicate constructor / field / method checks
      const fieldMethodNames: Array<string> = []

      if (declaration.children.ConstructorDeclaration) {
        this.zsVisitArray(declaration.children.ConstructorDeclaration)

        if (declaration.children.ConstructorDeclaration.length > 1) {
          declaration.children.ConstructorDeclaration.forEach((constructor) => {
            this.program.errors.push({
              start: constructor.location!.startOffset,
              end: constructor.location!.endOffset,
              message: `Duplicate constructor of ${child.cName}`,
            })
          })
        }
      }

      if (declaration.children.VariableDeclaration) {
        const variables = declaration.children.VariableDeclaration
        this.zsVisitArray(variables)

        for (const variable of variables) {
          const vName = this.handleIdentifier(variable.children.Identifier)
          if (fieldMethodNames.includes(vName)) {
            this.program.errors.push({
              start: variable.location!.startOffset,
              end: variable.location!.endOffset,
              message: `Duplicate field of ${vName}`,
            })
            continue
          }
          fieldMethodNames.push(vName)
        }
      }

      if (declaration.children.FunctionDeclaration) {
        const functions = declaration.children.FunctionDeclaration
        this.zsVisitArray(functions)

        for (const _function of functions) {
          const fName = this.handleIdentifier(_function.children.Identifier)
          if (fieldMethodNames.includes(fName)) {
            this.program.errors.push({
              start: _function.location!.startOffset,
              end: _function.location!.endOffset,
              message: `Duplicate method of ${fName}`,
            })
            continue
          }
          fieldMethodNames.push(fName)
        }
      }

      this.program.scopes[child.cName] = child.type
    }
  }

  VariableDeclaration(ctx: VariableDeclarationCstChildren): ASTNodeVariableDDeclare {
    const variable = ctx.VAL
      ? ctx.VAL[0]
      : ctx.VAR![0]

    return {
      start: variable.startOffset,
      end: ctx.SEMICOLON[0].endOffset,
      type: ctx.VAL ? 'val' : 'var',
      vName: this.handleIdentifier(ctx.Identifier),
      vType: {
        type: 'any',
        start: -1,
        end: -1,
      },
    }
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
    // duplicate parameter check
    const parameters: Array<string> = []
    const params = ctx.Parameter ?? []

    if (params.length > 0) {
      for (const _param of params) {
        const paramName = this.handleIdentifier(_param.children.Identifier)
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
      type: 'zen-class',
      start: ctx.ZEN_CLASS![0].startOffset,
      end: ctx.RCURLY?.[0].endOffset,
      cName: this.handleIdentifier(ctx.Identifier),
    }
  }

  ConstructorDeclaration(ctx: ConstructorDeclarationCstChildren): ASTNodeZenConstructor {
    return {
      type: 'zen-constructor',
      start: ctx.ZEN_CONSTRUCTOR[0].startOffset,
      end: ctx.constructorBody[0].location?.endOffset,
      pList: ctx.ParameterList
        ? this.visit(ctx.ParameterList)
        : [],
    }
  }

  handleIdentifier(identifier: IdentifierCstNode[]) {
    return identifier?.[0].children?.IDENTIFIER?.[0].image
      ?? identifier?.[0].children?.TO?.[0].image
      ?? 'unknown'
  }
}
