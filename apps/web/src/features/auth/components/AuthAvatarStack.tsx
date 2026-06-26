const avatars = [
  {
    label: 'CM',
    className: 'bg-[var(--color-primary)] text-white',
  },
  {
    label: 'LG',
    className: 'bg-[var(--color-secondary)] text-[var(--color-text)]',
  },
  {
    label: 'AR',
    className: 'bg-[var(--color-success)] text-white',
  },
  {
    label: 'JP',
    className: 'bg-[var(--color-danger)] text-white',
  },
];

export function AuthAvatarStack() {
  return (
    <div className='flex -space-x-3'>
      {avatars.map((avatar) => (
        <div
          key={avatar.label}
          className={[
            'flex size-9 items-center justify-center rounded-full border-2 border-white',
            'font-body text-xs font-bold',
            avatar.className,
          ].join(' ')}
        >
          {avatar.label}
        </div>
      ))}
    </div>
  );
}
