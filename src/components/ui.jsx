/* Backward-compatible re-export layer for the new design system.
 * Old call sites import from '../components/ui'; this file preserves
 * their original APIs while delegating to the token-based primitives.
 */
import { forwardRef } from 'react'
import { cn } from '../lib/utils'
import { Icon } from './icons'
import {
  Alert as AlertPrimitive,
  Badge as BadgePrimitive,
  Button as ButtonPrimitive,
  Card as CardPrimitive,
  CardHeader as CardHeaderPrimitive,
  Field as FieldPrimitive,
  EmptyState as EmptyStatePrimitive,
  PageHeader as PageHeaderPrimitive,
  Progress as ProgressPrimitive,
  TabButtons,
  inputClass as newInputClass,
} from './ui/index'

export {
  Avatar,
  NativeSelect,
  Input,
  Textarea,
  Label,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  DataGrid,
  SortHeader,
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogTitle,
  DialogDescription,
  ModalBody,
  ModalFooter,
  Sheet,
  SheetTrigger,
  SheetClose,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TabsList,
  TabsTrigger,
  TabsContent,
  Switch,
  Checkbox,
  Progress,
  Skeleton,
  Kbd,
  Breadcrumbs,
  StatCard,
  FormField,
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormFieldset,
  FormSection,
} from './ui/index'

export function inputClass(hasError, className = '') {
  return newInputClass(hasError, className)
}

const COLOR_TO_VARIANT = {
  slate: 'neutral',
  green: 'success',
  red: 'danger',
  amber: 'warning',
  blue: 'default',
}

export function Field(props) {
  return <FieldPrimitive {...props} />
}

export function Alert({ type = 'error', ...props }) {
  return <AlertPrimitive variant={type} {...props} />
}

export function Badge({ color = 'slate', ...props }) {
  return <BadgePrimitive variant={COLOR_TO_VARIANT[color] || 'neutral'} {...props} />
}

export function Card(props) {
  return <CardPrimitive {...props} />
}

export const CardHeader = forwardRef(function CardHeader(
  { title, subtitle, action, className, ...props },
  ref,
) {
  return (
    <CardHeaderPrimitive ref={ref} className={className} {...props}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
    </CardHeaderPrimitive>
  )
})

export function ProgressBar({ value, barClassName, ...props }) {
  return <ProgressPrimitive value={value} indicatorClassName={barClassName} {...props} />
}

export function Button({ variant, size, loading, icon, className, children, ...props }) {
  return (
    <ButtonPrimitive
      variant={variant}
      size={size}
      loading={loading}
      icon={icon}
      className={className}
      {...props}
    >
      {children}
    </ButtonPrimitive>
  )
}

export function PageHeader(props) {
  return <PageHeaderPrimitive {...props} />
}

export function EmptyState(props) {
  return <EmptyStatePrimitive {...props} />
}

export function Tabs({ options, value, onChange, className }) {
  return <TabButtons options={options} value={value} onChange={onChange} className={className} />
}

export function IconButton({ icon, label, className = '', ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60',
        className,
      )}
      {...props}
    >
      <Icon name={icon} className="size-4" />
    </button>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Search...', className = '', ...props }) {
  return (
    <div className={cn('relative flex-1 sm:max-w-sm', className)}>
      <Icon
        name="search"
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(newInputClass(false), 'pl-10')}
        {...props}
      />
    </div>
  )
}
