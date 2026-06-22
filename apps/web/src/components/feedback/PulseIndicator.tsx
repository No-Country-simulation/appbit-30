interface Props {
  value?: number;
}

export function PulseIndicator({ value = 188 }: Props) {
  return (
    <div
      className='
      animate-pulse-red
      flex
      items-center
      justify-center
      w-10
      h-10
      rounded-full
      bg-[var(--color-danger)]
      text-white
      font-semibold
      '
    >
      {value}
    </div>
  );
}
