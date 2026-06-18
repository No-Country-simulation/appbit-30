import { Button } from '../components/ui/button';

export default function Home() {
  return (
    <div className='flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black'>
      <h1 className='font-outfitHeading'>Hola desde Next.js</h1>
      <Button className='font-inter'>Test button</Button>
    </div>
  );
}
