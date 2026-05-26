# TypeScript 4.9 Typecheck Baseline - 2026-05-24

This baseline is informational. `typecheck` is not a CI gate in the Node 24 + pnpm 11 upgrade phase because existing application type errors are still being tracked as technical debt.

## Command

```bash
pnpm run typecheck
```

## Summary

| Metric | Value |
| --- | --- |
| TypeScript target | 4.9.5 |
| Exit status | 2 |
| Error lines | 791 |
| Output lines | 1155 |

## Error Codes

| Code | Count |
| --- | --- |
| TS2322 | 551 |
| TS2339 | 4 |
| TS2345 | 102 |
| TS2551 | 2 |
| TS2724 | 1 |
| TS2739 | 1 |
| TS2745 | 114 |
| TS2746 | 6 |
| TS2769 | 8 |
| TS2794 | 2 |

## Output Excerpt

```text
src/components/AchievementsModal.tsx(270,38): error TS2322: Type '{ children: string; type: "primary"; size: "small"; onClick: () => void; }' is not assignable to type 'IntrinsicAttributes & (IntrinsicClassAttributes<Button> & ((Pick<Pick<Readonly<NativeButtonProps> & Readonly<...>, "title" | ... 270 more ... | "onTransitionEndCapture"> & Pick<...> & Pick<...>, "title" | ... 267 more ... | "onTransitionEndCapture"> & Partial<...> & Partial<...>) | (Pick<...> & ... 1 more ... & Part...'.
  Property 'href' is missing in type '{ children: string; type: "primary"; size: "small"; onClick: () => void; }' but required in type 'Pick<Pick<Readonly<AnchorButtonProps> & Readonly<{ children?: ReactNode; }>, "title" | "prefix" | "type" | "placeholder" | ... 263 more ... | "referrerPolicy"> & Pick<...> & Pick<...>, "title" | ... 265 more ... | "referrerPolicy">'.
src/components/AchievementsModal.tsx(350,41): error TS2345: Argument of type 'ComponentClass<Pick<any, string | number | symbol> & { wrappedComponentRef?: Ref<AchievementsModal>; }, any> & WithRouterStatics<typeof AchievementsModal>' is not assignable to parameter of type 'ComponentType<never>'.
  Type 'ComponentClass<Pick<any, string | number | symbol> & { wrappedComponentRef?: Ref<AchievementsModal>; }, any> & WithRouterStatics<typeof AchievementsModal>' is not assignable to type 'ComponentClass<never, any>'.
    Types of property 'propTypes' are incompatible.
      Type 'WeakValidationMap<Pick<any, string | number | symbol> & { wrappedComponentRef?: Ref<AchievementsModal>; }>' is not assignable to type 'never'.
src/components/AddFavorite.tsx(109,16): error TS2322: Type '{ children: string; type: "primary"; block: true; loading: boolean; onClick: (e: MouseEvent<Element, MouseEvent>) => void; }' is not assignable to type 'IntrinsicAttributes & (IntrinsicClassAttributes<Button> & ((Pick<Pick<Readonly<NativeButtonProps> & Readonly<...>, "title" | ... 270 more ... | "onTransitionEndCapture"> & Pick<...> & Pick<...>, "title" | ... 267 more ... | "onTransitionEndCapture"> & Partial<...> & Partial<...>) | (Pick<...> & ... 1 more ... & Part...'.
  Property 'href' is missing in type '{ children: string; type: "primary"; block: true; loading: boolean; onClick: (e: MouseEvent<Element, MouseEvent>) => void; }' but required in type 'Pick<Pick<Readonly<AnchorButtonProps> & Readonly<{ children?: ReactNode; }>, "title" | "prefix" | "type" | "placeholder" | ... 263 more ... | "referrerPolicy"> & Pick<...> & Pick<...>, "title" | ... 265 more ... | "referrerPolicy">'.
src/components/AddFavorite.tsx(135,41): error TS2345: Argument of type 'typeof AddFavorite' is not assignable to parameter of type 'ComponentType<never>'.
  Type 'typeof AddFavorite' is not assignable to type 'ComponentClass<never, any>'.
    The types of 'contextType.Provider(...).type' are incompatible between these types.
      Type 'string | React.JSXElementConstructor<any>' is not assignable to type 'string | import("node_modules/.pnpm/@types+react@16.14.70/node_modules/@types/react/index").JSXElementConstructor<any>'.
        Type '(props: any) => ReactElement<any, any>' is not assignable to type 'string | JSXElementConstructor<any>'.
          Type '(props: any) => React.ReactElement<any, any>' is not assignable to type '(props: any) => import("node_modules/.pnpm/@types+react@16.14.70/node_modules/@types/react/index").ReactElement<any, any>'.
            Call signature return types 'ReactElement<any, any>' and 'ReactElement<any, any>' are incompatible.
              The types of 'key' are incompatible between these types.
                Type 'Key' is not assignable to type 'string'.
                  Type 'number' is not assignable to type 'string'.
src/components/AddGroupMemberModal.tsx(89,30): error TS2322: Type 'boolean' is not assignable to type 'never'.
src/components/AddGroupMemberModal.tsx(89,39): error TS2322: Type 'string' is not assignable to type 'never'.
src/components/AddGroupMemberModal.tsx(104,41): error TS2345: Argument of type 'ComponentClass<RcBaseFormProps & Omit<any, "form">, any>' is not assignable to parameter of type 'ComponentType<never>'.
  Type 'ComponentClass<RcBaseFormProps & Omit<any, "form">, any>' is not assignable to type 'ComponentClass<never, any>'.
    Types of property 'propTypes' are incompatible.
      Type 'WeakValidationMap<RcBaseFormProps & Omit<any, "form">>' is not assignable to type 'never'.
src/components/AddTeamMemberModal.tsx(74,19): error TS2322: Type 'string' is not assignable to type 'never'.
src/components/AddTeamMemberModal.tsx(75,19): error TS2322: Type '(u: any) => string' is not assignable to type 'never'.
src/components/AddTeamMemberModal.tsx(96,41): error TS2345: Argument of type 'ComponentClass<RcBaseFormProps & Omit<any, "form">, any>' is not assignable to parameter of type 'ComponentType<never>'.
src/components/AddUserModal.tsx(71,30): error TS2322: Type 'boolean' is not assignable to type 'never'.
src/components/AddUserModal.tsx(71,50): error TS2322: Type 'string' is not assignable to type 'never'.
src/components/AddUserModal.tsx(71,89): error TS2322: Type '(user: IUser) => string' is not assignable to type 'never'.
src/components/AutoVideoScreen.tsx(72,10): error TS2322: Type '{ children: string; type: "ghost"; onClick: () => void; style: { color: "#d9d9d9"; position: "fixed"; top: string; right: string; opacity: number; }; }' is not assignable to type 'IntrinsicAttributes & (IntrinsicClassAttributes<Button> & ((Pick<Pick<Readonly<NativeButtonProps> & Readonly<...>, "title" | ... 270 more ... | "onTransitionEndCapture"> & Pick<...> & Pick<...>, "title" | ... 267 more ... | "onTransitionEndCapture"> & Partial<...> & Partial<...>) | (Pick<...> & ... 1 more ... & Part...'.
  Property 'href' is missing in type '{ children: string; type: "ghost"; onClick: () => void; style: { color: "#d9d9d9"; position: "fixed"; top: string; right: string; opacity: number; }; }' but required in type 'Pick<Pick<Readonly<AnchorButtonProps> & Readonly<{ children?: ReactNode; }>, "title" | "prefix" | "type" | "placeholder" | ... 263 more ... | "referrerPolicy"> & Pick<...> & Pick<...>, "title" | ... 265 more ... | "referrerPolicy">'.
src/components/ChangeEmailModal.tsx(178,41): error TS2345: Argument of type 'ComponentClass<RcBaseFormProps & Omit<any, "form">, any>' is not assignable to parameter of type 'ComponentType<never>'.
src/components/ContestUserList.tsx(705,26): error TS2745: This JSX tag's 'children' prop expects type 'never' which requires multiple children, but only a single child was provided.
src/components/ContestUserList.tsx(706,27): error TS2322: Type 'string' is not assignable to type 'never'.
src/components/ContestUserList.tsx(707,27): error TS2322: Type 'string' is not assignable to type 'never'.
src/components/ContestUserList.tsx(708,27): error TS2322: Type 'boolean' is not assignable to type 'never'.
src/components/ContestUserList.tsx(709,27): error TS2322: Type 'boolean' is not assignable to type 'never'.
src/components/ContestUserList.tsx(710,27): error TS2322: Type 'any[]' is not assignable to type 'never'.
src/components/ContestUserList.tsx(717,27): error TS2322: Type '(dispatch: Dispatch<Action>, values: any) => Promise<any>' is not assignable to type 'never'.
src/components/ContestUserList.tsx(748,27): error TS2322: Type '(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>) => void' is not assignable to type 'never'.
src/components/ContestUserList.tsx(755,27): error TS2322: Type '(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>) => void' is not assignable to type 'never'.
src/components/ContestUserList.tsx(778,26): error TS2745: This JSX tag's 'children' prop expects type 'never' which requires multiple children, but only a single child was provided.
src/components/ContestUserList.tsx(779,27): error TS2322: Type 'string' is not assignable to type 'never'.
src/components/ContestUserList.tsx(780,27): error TS2322: Type 'string' is not assignable to type 'never'.
src/components/ContestUserList.tsx(781,27): error TS2322: Type 'boolean' is not assignable to type 'never'.
src/components/ContestUserList.tsx(782,27): error TS2322: Type 'boolean' is not assignable to type 'never'.
src/components/ContestUserList.tsx(783,27): error TS2322: Type '({ name: string; field: string; component: string; options: { name: string; value: ContestUserStatus; }[]; initialValue: string; rules: { required: boolean; message: string; }[]; placeholder?: undefined; } | { ...; })[]' is not assignable to type 'never'.
src/components/ContestUserList.tsx(784,27): error TS2322: Type '(dispatch: Dispatch<Action>, values: any) => Promise<any>' is not assignable to type 'never'.
src/components/ContestUserList.tsx(796,27): error TS2322: Type '(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>) => void' is not assignable to type 'never'.
src/components/ContestUserList.tsx(803,27): error TS2322: Type '(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>) => void' is not assignable to type 'never'.
src/components/ContestUserList.tsx(841,16): error TS2745: This JSX tag's 'children' prop expects type 'never' which requires multiple children, but only a single child was provided.
src/components/ContestUserList.tsx(842,17): error TS2322: Type 'string' is not assignable to type 'never'.
src/components/ContestUserList.tsx(843,17): error TS2322: Type 'string' is not assignable to type 'never'.
src/components/ContestUserList.tsx(844,17): error TS2322: Type 'boolean' is not assignable to type 'never'.
src/components/ContestUserList.tsx(845,17): error TS2322: Type 'boolean' is not assignable to type 'never'.
src/components/ContestUserList.tsx(846,17): error TS2322: Type 'any[]' is not assignable to type 'never'.
src/components/ContestUserList.tsx(847,17): error TS2322: Type '(dispatch: Dispatch<Action>, values: any) => Promise<any>' is not assignable to type 'never'.
src/components/ContestUserList.tsx(880,17): error TS2322: Type '(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>) => void' is not assignable to type 'never'.
src/components/ContestUserList.tsx(887,17): error TS2322: Type '(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>) => void' is not assignable to type 'never'.
src/components/ContestUserList.tsx(902,16): error TS2745: This JSX tag's 'children' prop expects type 'never' which requires multiple children, but only a single child was provided.
src/components/ContestUserList.tsx(902,39): error TS2322: Type 'number' is not assignable to type 'never'.
src/components/ContestUserList.tsx(933,41): error TS2345: Argument of type 'ComponentClass<Pick<any, string | number | symbol> & { wrappedComponentRef?: Ref<ContestUserList>; }, any> & WithRouterStatics<typeof ContestUserList>' is not assignable to parameter of type 'ComponentType<never>'.
  Type 'ComponentClass<Pick<any, string | number | symbol> & { wrappedComponentRef?: Ref<ContestUserList>; }, any> & WithRouterStatics<typeof ContestUserList>' is not assignable to type 'ComponentClass<never, any>'.
    Types of property 'propTypes' are incompatible.
      Type 'WeakValidationMap<Pick<any, string | number | symbol> & { wrappedComponentRef?: Ref<ContestUserList>; }>' is not assignable to type 'never'.
src/components/DeleteFavorite.tsx(95,41): error TS2345: Argument of type 'typeof DeleteFavorite' is not assignable to parameter of type 'ComponentType<never>'.
  Type 'typeof DeleteFavorite' is not assignable to type 'ComponentClass<never, any>'.
    Types of property 'contextType' are incompatible.
      Type 'React.Context<any>' is not assignable to type 'import("node_modules/.pnpm/@types+react@16.14.70/node_modules/@types/react/index").Context<any>'.
src/components/EditProblemPropModal.tsx(206,25): error TS2769: No overload matches this call.
  Overload 1 of 2, '(props: OptionProps, context?: any): ClassicComponent<OptionProps, any>', gave the following error.
    Type '{ children: ReactNode; key: string; value: string; title: string; label: ReactNode; }' is not assignable to type 'IntrinsicAttributes & IntrinsicClassAttributes<ClassicComponent<OptionProps, any>> & Readonly<...> & Readonly<...>'.
      Property 'label' does not exist on type 'IntrinsicAttributes & IntrinsicClassAttributes<ClassicComponent<OptionProps, any>> & Readonly<...> & Readonly<...>'.
  Overload 2 of 2, '(props: OptionProps, context?: any): Component<OptionProps, any, any>', gave the following error.
    Type '{ children: ReactNode; key: string; value: string; title: string; label: ReactNode; }' is not assignable to type 'IntrinsicAttributes & IntrinsicClassAttributes<Component<OptionProps, any, any>> & Readonly<OptionProps> & Readonly<...>'.
      Property 'label' does not exist on type 'IntrinsicAttributes & IntrinsicClassAttributes<Component<OptionProps, any, any>> & Readonly<OptionProps> & Readonly<...>'.
src/components/EditProblemPropModal.tsx(229,41): error TS2345: Argument of type 'ComponentClass<RcBaseFormProps & Omit<any, "form">, any>' is not assignable to parameter of type 'ComponentType<never>'.
src/components/GeneralForm.tsx(148,29): error TS2769: No overload matches this call.
  Overload 1 of 2, '(props: OptionProps, context?: any): ClassicComponent<OptionProps, any>', gave the following error.
    Type '{ children: ReactNode[]; key: string; value: string; label: string; }' is not assignable to type 'IntrinsicAttributes & IntrinsicClassAttributes<ClassicComponent<OptionProps, any>> & Readonly<...> & Readonly<...>'.
      Property 'label' does not exist on type 'IntrinsicAttributes & IntrinsicClassAttributes<ClassicComponent<OptionProps, any>> & Readonly<...> & Readonly<...>'.
  Overload 2 of 2, '(props: OptionProps, context?: any): Component<OptionProps, any, any>', gave the following error.
    Type '{ children: ReactNode[]; key: string; value: string; label: string; }' is not assignable to type 'IntrinsicAttributes & IntrinsicClassAttributes<Component<OptionProps, any, any>> & Readonly<OptionProps> & Readonly<...>'.
      Property 'label' does not exist on type 'IntrinsicAttributes & IntrinsicClassAttributes<Component<OptionProps, any, any>> & Readonly<OptionProps> & Readonly<...>'.
src/components/GeneralFormDrawer.tsx(154,16): error TS2322: Type '{ children: string; onClick: () => void; type: "primary"; loading: boolean; }' is not assignable to type 'IntrinsicAttributes & (IntrinsicClassAttributes<Button> & ((Pick<Pick<Readonly<NativeButtonProps> & Readonly<...>, "title" | ... 270 more ... | "onTransitionEndCapture"> & Pick<...> & Pick<...>, "title" | ... 267 more ... | "onTransitionEndCapture"> & Partial<...> & Partial<...>) | (Pick<...> & ... 1 more ... & Part...'.
  Property 'href' is missing in type '{ children: string; onClick: () => void; type: "primary"; loading: boolean; }' but required in type 'Pick<Pick<Readonly<AnchorButtonProps> & Readonly<{ children?: ReactNode; }>, "title" | "prefix" | "type" | "placeholder" | ... 263 more ... | "referrerPolicy"> & Pick<...> & Pick<...>, "title" | ... 265 more ... | "referrerPolicy">'.
src/components/GeneralFormDrawer.tsx(171,41): error TS2345: Argument of type 'ComponentClass<RcBaseFormProps & Omit<IGeneralFormDrawerProps, "form">, any>' is not assignable to parameter of type 'ComponentType<never>'.
  Type 'ComponentClass<RcBaseFormProps & Omit<IGeneralFormDrawerProps, "form">, any>' is not assignable to type 'ComponentClass<never, any>'.
    Types of property 'propTypes' are incompatible.
      Type 'WeakValidationMap<RcBaseFormProps & Omit<IGeneralFormDrawerProps, "form">>' is not assignable to type 'never'.
src/components/GeneralFormModal.tsx(139,41): error TS2345: Argument of type 'ComponentClass<RcBaseFormProps & Omit<IGeneralFormModalProps, "form">, any>' is not assignable to parameter of type 'ComponentType<never>'.
  Type 'ComponentClass<RcBaseFormProps & Omit<IGeneralFormModalProps, "form">, any>' is not assignable to type 'ComponentClass<never, any>'.
    Types of property 'propTypes' are incompatible.
      Type 'WeakValidationMap<RcBaseFormProps & Omit<IGeneralFormModalProps, "form">>' is not assignable to type 'never'.
src/components/GenshinModal.tsx(143,41): error TS2345: Argument of type 'typeof GenshinModal' is not assignable to parameter of type 'ComponentType<never>'.
  Type 'typeof GenshinModal' is not assignable to type 'ComponentClass<never, any>'.
    Types of property 'contextType' are incompatible.
      Type 'React.Context<any>' is not assignable to type 'import("node_modules/.pnpm/@types+react@16.14.70/node_modules/@types/react/index").Context<any>'.
src/components/GroupList.tsx(44,10): error TS2745: This JSX tag's 'children' prop expects type 'never' which requires multiple children, but only a single child was provided.
src/components/GroupList.tsx(45,11): error TS2322: Type 'string' is not assignable to type 'never'.
src/components/GroupList.tsx(46,11): error TS2322: Type 'number' is not assignable to type 'never'.
src/components/GroupList.tsx(47,11): error TS2322: Type 'boolean' is not assignable to type 'never'.
src/components/GroupList.tsx(48,11): error TS2322: Type '{ paddingLeft: string; fontSize: string; }' is not assignable to type 'never'.
src/components/GroupList.tsx(55,10): error TS2745: This JSX tag's 'children' prop expects type 'never' which requires multiple children, but only a single child was provided.
src/components/GroupList.tsx(56,11): error TS2322: Type 'number' is not assignable to type 'never'.
src/components/GroupList.tsx(57,11): error TS2322: Type 'boolean' is not assignable to type 'never'.
src/components/GroupList.tsx(58,11): error TS2322: Type '{ paddingLeft: string; fontSize: string; }' is not assignable to type 'never'.
src/components/GroupList.tsx(140,41): error TS2345: Argument of type 'typeof GroupList' is not assignable to parameter of type 'ComponentType<never>'.
  Type 'typeof GroupList' is not assignable to type 'ComponentClass<never, any>'.
    Types of property 'contextType' are incompatible.
      Type 'React.Context<any>' is not assignable to type 'import("node_modules/.pnpm/@types+react@16.14.70/node_modules/@types/react/index").Context<any>'.
src/components/IdeaNotes.tsx(171,10): error TS2322: Type '{ children: (string | Element)[]; type: "primary"; block: true; style: { marginTop: string; marginBottom: string; }; onClick: () => void; loading: boolean; }' is not assignable to type 'IntrinsicAttributes & (IntrinsicClassAttributes<Button> & ((Pick<Pick<Readonly<NativeButtonProps> & Readonly<...>, "title" | ... 270 more ... | "onTransitionEndCapture"> & Pick<...> & Pick<...>, "title" | ... 267 more ... | "onTransitionEndCapture"> & Partial<...> & Partial<...>) | (Pick<...> & ... 1 more ... & Part...'.
  Property 'href' is missing in type '{ children: (string | Element)[]; type: "primary"; block: true; style: { marginTop: string; marginBottom: string; }; onClick: () => void; loading: boolean; }' but required in type 'Pick<Pick<Readonly<AnchorButtonProps> & Readonly<{ children?: ReactNode; }>, "title" | "prefix" | "type" | "placeholder" | ... 263 more ... | "referrerPolicy"> & Pick<...> & Pick<...>, "title" | ... 265 more ... | "referrerPolicy">'.
src/components/IdeaNotes.tsx(266,32): error TS2322: Type 'number' is not assignable to type 'never'.
src/components/IdeaNotes.tsx(293,41): error TS2345: Argument of type 'ComponentClass<RcBaseFormProps & Omit<any, "form">, any>' is not assignable to parameter of type 'ComponentType<never>'.
src/components/ImportGroupModal.tsx(166,41): error TS2345: Argument of type 'ComponentClass<RcBaseFormProps & Omit<any, "form">, any>' is not assignable to parameter of type 'ComponentType<never>'.
src/components/ImportSetModal.tsx(220,41): error TS2345: Argument of type 'ComponentClass<RcBaseFormProps & Omit<any, "form">, any>' is not assignable to parameter of type 'ComponentType<never>'.
src/components/ManageSessionModal.tsx(114,28): error TS2322: Type 'number' is not assignable to type 'never'.
src/components/ManageSessionModal.tsx(125,28): error TS2322: Type 'number' is not assignable to type 'never'.
src/components/ManageSessionModal.tsx(155,41): error TS2345: Argument of type 'typeof ManageSessionModal' is not assignable to parameter of type 'ComponentType<never>'.
  Type 'typeof ManageSessionModal' is not assignable to type 'ComponentClass<never, any>'.
    Types of property 'contextType' are incompatible.
      Type 'React.Context<any>' is not assignable to type 'import("node_modules/.pnpm/@types+react@16.14.70/node_modules/@types/react/index").Context<any>'.
src/components/MessageList.tsx(100,18): error TS2745: This JSX tag's 'children' prop expects type 'never' which requires multiple children, but only a single child was provided.
src/components/MessageList.tsx(100,35): error TS2322: Type 'number' is not assignable to type 'never'.
src/components/NoticeModal.tsx(88,14): error TS2322: Type '{ children: string; type: "primary"; style: { marginTop: string; }; }' is not assignable to type 'IntrinsicAttributes & (IntrinsicClassAttributes<Button> & ((Pick<Pick<Readonly<NativeButtonProps> & Readonly<...>, "title" | ... 270 more ... | "onTransitionEndCapture"> & Pick<...> & Pick<...>, "title" | ... 267 more ... | "onTransitionEndCapture"> & Partial<...> & Partial<...>) | (Pick<...> & ... 1 more ... & Part...'.
  Property 'href' is missing in type '{ children: string; type: "primary"; style: { marginTop: string; }; }' but required in type 'Pick<Pick<Readonly<AnchorButtonProps> & Readonly<{ children?: ReactNode; }>, "title" | "prefix" | "type" | "placeholder" | ... 263 more ... | "referrerPolicy"> & Pick<...> & Pick<...>, "title" | ... 265 more ... | "referrerPolicy">'.
src/components/NoticeModal.tsx(104,41): error TS2345: Argument of type 'typeof NoticeModal' is not assignable to parameter of type 'ComponentType<never>'.
  Type 'typeof NoticeModal' is not assignable to type 'ComponentClass<never, any>'.
    Types of property 'contextType' are incompatible.
      Type 'React.Context<any>' is not assignable to type 'import("node_modules/.pnpm/@types+react@16.14.70/node_modules/@types/react/index").Context<any>'.
src/components/PageAnimation.tsx(28,41): error TS2345: Argument of type 'typeof PageAnimation' is not assignable to parameter of type 'ComponentType<never>'.
  Type 'typeof PageAnimation' is not assignable to type 'ComponentClass<never, any>'.
    Types of property 'contextType' are incompatible.
      Type 'React.Context<any>' is not assignable to type 'import("node_modules/.pnpm/@types+react@16.14.70/node_modules/@types/react/index").Context<any>'.
src/components/ProblemContent.tsx(152,13): error TS2322: Type 'number' is not assignable to type 'never'.
src/components/ProblemContent.tsx(153,13): error TS2322: Type 'number' is not assignable to type 'never'.
src/components/ProblemContent.tsx(154,13): error TS2322: Type 'string' is not assignable to type 'never'.
src/components/ProblemContent.tsx(155,13): error TS2322: Type 'string' is not assignable to type 'never'.
src/components/ProblemDetailPage.tsx(81,38): error TS2322: Type '{ children: string; type: "primary"; block: true; disabled: true; }' is not assignable to type 'IntrinsicAttributes & (IntrinsicClassAttributes<Button> & ((Pick<Pick<Readonly<NativeButtonProps> & Readonly<...>, "title" | ... 270 more ... | "onTransitionEndCapture"> & Pick<...> & Pick<...>, "title" | ... 267 more ... | "onTransitionEndCapture"> & Partial<...> & Partial<...>) | (Pick<...> & ... 1 more ... & Part...'.
  Property 'disabled' does not exist on type 'IntrinsicAttributes & IntrinsicClassAttributes<Button> & Pick<Pick<Readonly<AnchorButtonProps> & Readonly<...>, "title" | ... 266 more ... | "referrerPolicy"> & Pick<...> & Pick<...>, "title" | ... 265 more ... | "referrerPolicy"> & Partial<...> & Partial<...>'.
src/components/ProblemDetailPage.tsx(88,38): error TS2322: Type '{ children: string; type: "primary"; block: true; disabled: true; }' is not assignable to type 'IntrinsicAttributes & (IntrinsicClassAttributes<Button> & ((Pick<Pick<Readonly<NativeButtonProps> & Readonly<...>, "title" | ... 270 more ... | "onTransitionEndCapture"> & Pick<...> & Pick<...>, "title" | ... 267 more ... | "onTransitionEndCapture"> & Partial<...> & Partial<...>) | (Pick<...> & ... 1 more ... & Part...'.
  Property 'disabled' does not exist on type 'IntrinsicAttributes & IntrinsicClassAttributes<Button> & Pick<Pick<Readonly<AnchorButtonProps> & Readonly<...>, "title" | ... 266 more ... | "referrerPolicy"> & Pick<...> & Pick<...>, "title" | ... 265 more ... | "referrerPolicy"> & Partial<...> & Partial<...>'.
src/components/ProblemDetailPage.tsx(109,8): error TS2745: This JSX tag's 'children' prop expects type 'never' which requires multiple children, but only a single child was provided.
src/components/ProblemDetailPage.tsx(110,9): error TS2322: Type 'number' is not assignable to type 'never'.
src/components/ProblemDetailPage.tsx(111,9): error TS2322: Type 'IProblem' is not assignable to type 'never'.
src/components/ProblemDetailPage.tsx(112,9): error TS2322: Type 'string' is not assignable to type 'never'.
src/components/ProblemDetailPage.tsx(113,9): error TS2322: Type 'number' is not assignable to type 'never'.
src/components/ProblemDetailPage.tsx(114,9): error TS2322: Type 'number' is not assignable to type 'never'.
src/components/ProblemDetailPage.tsx(115,9): error TS2322: Type 'number' is not assignable to type 'never'.
src/components/ProblemDetailPage.tsx(116,9): error TS2322: Type 'string' is not assignable to type 'never'.
src/components/ProblemDetailPage.tsx(117,9): error TS2322: Type 'RouteLocation' is not assignable to type 'never'.
src/components/ProblemDetailPage.tsx(119,10): error TS2322: Type '{ children: string; type: "primary"; block: true; }' is not assignable to type 'IntrinsicAttributes & (IntrinsicClassAttributes<Button> & ((Pick<Pick<Readonly<NativeButtonProps> & Readonly<...>, "title" | ... 270 more ... | "onTransitionEndCapture"> & Pick<...> & Pick<...>, "title" | ... 267 more ... | "onTransitionEndCapture"> & Partial<...> & Partial<...>) | (Pick<...> & ... 1 more ... & Part...'.
  Property 'href' is missing in type '{ children: string; type: "primary"; block: true; }' but required in type 'Pick<Pick<Readonly<AnchorButtonProps> & Readonly<{ children?: ReactNode; }>, "title" | "prefix" | "type" | "placeholder" | ... 263 more ... | "referrerPolicy"> & Pick<...> & Pick<...>, "title" | ... 265 more ... | "referrerPolicy">'.
src/components/ProblemDetailPage.tsx(128,8): error TS2746: This JSX tag's 'children' prop expects a single child of type 'never', but multiple children were provided.
src/components/ProblemDetailPage.tsx(163,20): error TS2745: This JSX tag's 'children' prop expects type 'never' which requires multiple children, but only a single child was provided.
src/components/ProblemDetailPage.tsx(163,32): error TS2322: Type 'string' is not assignable to type 'never'.
src/components/ProblemDetailPage.tsx(163,47): error TS2322: Type 'number' is not assignable to type 'never'.
src/components/ProblemDetailPage.tsx(169,20): error TS2745: This JSX tag's 'children' prop expects type 'never' which requires multiple children, but only a single child was provided.
src/components/ProblemDetailPage.tsx(169,35): error TS2322: Type 'number' is not assignable to type 'never'.
src/components/ProblemDetailPage.tsx(299,16): error TS2745: This JSX tag's 'children' prop expects type 'never' which requires multiple children, but only a single child was provided.
src/components/ProblemDetailPage.tsx(299,37): error TS2322: Type 'IProblem' is not assignable to type 'never'.
src/components/ProblemDetailPage.tsx(321,12): error TS2745: This JSX tag's 'children' prop expects type 'never' which requires multiple children, but only a single child was provided.
src/components/ProblemDetailPage.tsx(346,41): error TS2345: Argument of type 'ComponentClass<Pick<Props, "competitionId" | "contestId" | "data" | "session" | "loading" | "favorites" | "problemIndex" | "problemAlias" | "mobile" | "contestTimeStatus">, any> & WithRouterStatics<...>' is not assignable to parameter of type 'ComponentType<never>'.
  Type 'ComponentClass<Pick<Props, "competitionId" | "contestId" | "data" | "session" | "loading" | "favorites" | "problemIndex" | "problemAlias" | "mobile" | "contestTimeStatus">, any> & WithRouterStatics<...>' is not assignable to type 'ComponentClass<never, any>'.
    Types of property 'propTypes' are incompatible.
      Type 'WeakValidationMap<Pick<Props, "competitionId" | "contestId" | "data" | "session" | "loading" | "favorites" | "problemIndex" | "problemAlias" | "mobile" | "contestTimeStatus">>' is not assignable to type 'never'.
src/components/ProblemDifficulty.tsx(89,41): error TS2345: Argument of type 'typeof ProblemDifficulty' is not assignable to parameter of type 'ComponentType<never>'.
  Type 'typeof ProblemDifficulty' is not assignable to type 'ComponentClass<never, any>'.
    Types of property 'contextType' are incompatible.
      Type 'React.Context<any>' is not assignable to type 'import("node_modules/.pnpm/@types+react@16.14.70/node_modules/@types/react/index").Context<any>'.
src/components/Ranklist.tsx(299,68): error TS2345: Argument of type 'IUserLite & { globalUserId?: number; oldRating?: number; newRating?: number; }' is not assignable to parameter of type 'IUser'.
  Property 'forbidden' is missing in type 'IUserLite & { globalUserId?: number; oldRating?: number; newRating?: number; }' but required in type 'IUser'.
src/components/ReceiveBalloonModal.tsx(122,41): error TS2345: Argument of type 'typeof ReceiveBalloonModal' is not assignable to parameter of type 'ComponentType<never>'.
  Type 'typeof ReceiveBalloonModal' is not assignable to type 'ComponentClass<never, any>'.
    Types of property 'contextType' are incompatible.
      Type 'React.Context<any>' is not assignable to type 'import("node_modules/.pnpm/@types+react@16.14.70/node_modules/@types/react/index").Context<any>'.
src/components/ResultBar.tsx(195,41): error TS2345: Argument of type 'typeof ResultBar' is not assignable to parameter of type 'ComponentType<never>'.
  Type 'typeof ResultBar' is not assignable to type 'ComponentClass<never, any>'.
    Types of property 'contextType' are incompatible.
      Type 'React.Context<any>' is not assignable to type 'import("node_modules/.pnpm/@types+react@16.14.70/node_modules/@types/react/index").Context<any>'.
src/components/ResultBarFake.tsx(123,41): error TS2345: Argument of type 'typeof ResultBarFake' is not assignable to parameter of type 'ComponentType<never>'.
  Type 'typeof ResultBarFake' is not assignable to type 'ComponentClass<never, any>'.
    Types of property 'contextType' are incompatible.
      Type 'React.Context<any>' is not assignable to type 'import("node_modules/.pnpm/@types+react@16.14.70/node_modules/@types/react/index").Context<any>'.
src/components/SelfTeamsModal.tsx(139,28): error TS2322: Type 'number' is not assignable to type 'never'.
src/components/SelfTeamsModal.tsx(158,41): error TS2345: Argument of type 'ComponentClass<RcBaseFormProps & Omit<any, "form">, any>' is not assignable to parameter of type 'ComponentType<never>'.
src/components/SendMessageModal.tsx(111,41): error TS2345: Argument of type 'ComponentClass<RcBaseFormProps & Omit<any, "form">, any>' is not assignable to parameter of type 'ComponentType<never>'.
src/components/SettingsModal.tsx(211,41): error TS2345: Argument of type 'ComponentClass<Pick<any, string | number | symbol> & { wrappedComponentRef?: Ref<SettingsModal>; }, any> & WithRouterStatics<typeof SettingsModal>' is not assignable to parameter of type 'ComponentType<never>'.
  Type 'ComponentClass<Pick<any, string | number | symbol> & { wrappedComponentRef?: Ref<SettingsModal>; }, any> & WithRouterStatics<typeof SettingsModal>' is not assignable to type 'ComponentClass<never, any>'.
    Types of property 'propTypes' are incompatible.
      Type 'WeakValidationMap<Pick<any, string | number | symbol> & { wrappedComponentRef?: Ref<SettingsModal>; }>' is not assignable to type 'never'.
src/components/SolutionDetailPage.tsx(238,14): error TS2322: Type '{ children: string; type: "primary"; size: "small"; className: string; }' is not assignable to type 'IntrinsicAttributes & (IntrinsicClassAttributes<Button> & ((Pick<Pick<Readonly<NativeButtonProps> & Readonly<...>, "title" | ... 270 more ... | "onTransitionEndCapture"> & Pick<...> & Pick<...>, "title" | ... 267 more ... | "onTransitionEndCapture"> & Partial<...> & Partial<...>) | (Pick<...> & ... 1 more ... & Part...'.
  Property 'href' is missing in type '{ children: string; type: "primary"; size: "small"; className: string; }' but required in type 'Pick<Pick<Readonly<AnchorButtonProps> & Readonly<{ children?: ReactNode; }>, "title" | "prefix" | "type" | "placeholder" | ... 263 more ... | "referrerPolicy"> & Pick<...> & Pick<...>, "title" | ... 265 more ... | "referrerPolicy">'.
src/components/SolutionDetailPage.tsx(248,12): error TS2322: Type '{ children: string; type: "default"; size: "small"; className: string; onClick: () => void; }' is not assignable to type 'IntrinsicAttributes & (IntrinsicClassAttributes<Button> & ((Pick<Pick<Readonly<NativeButtonProps> & Readonly<...>, "title" | ... 270 more ... | "onTransitionEndCapture"> & Pick<...> & Pick<...>, "title" | ... 267 more ... | "onTransitionEndCapture"> & Partial<...> & Partial<...>) | (Pick<...> & ... 1 more ... & Part...'.
  Property 'href' is missing in type '{ children: string; type: "default"; size: "small"; className: string; onClick: () => void; }' but required in type 'Pick<Pick<Readonly<AnchorButtonProps> & Readonly<{ children?: ReactNode; }>, "title" | "prefix" | "type" | "placeholder" | ... 263 more ... | "referrerPolicy"> & Pick<...> & Pick<...>, "title" | ... 265 more ... | "referrerPolicy">'.
src/components/SolutionDetailPage.tsx(324,15): error TS2769: No overload matches this call.
  Overload 1 of 2, '(props: PopoverProps | Readonly<PopoverProps>): Popover', gave the following error.
    Type '{ children: Element; placement: "bottomRight"; title: string; content: Element; trigger: "click"; onClick: () => void; }' is not assignable to type 'IntrinsicAttributes & IntrinsicClassAttributes<Popover> & Pick<Readonly<PopoverProps> & Readonly<...>, "title" | ... 13 more ... | "getPopupContainer"> & Partial<...> & Partial<...>'.
... truncated 955 additional lines ...
```
