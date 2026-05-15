import EditPropertyClient from './EditPropertyClient';

export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function Page() {
  return <EditPropertyClient />;
}
